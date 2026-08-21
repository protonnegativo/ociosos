import { writable, derived, get } from "svelte/store";
import Decimal from "break_infinity.js";
import { HEROES, HEROES_BY_ID, milestoneMultiplier, type HeroDef, type Faction } from "./heroes";
import { threatThreshold, threatReward, threatMultiplier, threatFor } from "./threats";
import { UPGRADES, UPGRADES_BY_ID, type UpgradeContext } from "./upgrades";
import { PROTOCOLS_BY_ID, protocolCost, seedVerba, dossiesFor, dossiesRaw, dossieCap } from "./protocols";
import { OPERATIONS_BY_ID, EQUIPPED_BONUS, type OperationDef } from "./operations";
import {
  DEPARTMENTS,
  DEPARTMENTS_BY_ID,
  DEFAULT_DEPARTMENT,
  intelRate,
  equipRate,
  type DepartmentDef,
} from "./departments";
import { ACHIEVEMENTS, ACHIEVEMENT_BONUS, type AchievementContext } from "./achievements";
import { formatNumber } from "./format";

export type BuyAmount = 1 | 10 | 100 | "max";

export interface ActiveBuff {
  kind: "forca";
  label: string;
  mult: number;
  until: number;
}

export interface Alerta {
  id: number;
  x: number;
  y: number;
  expiresAt: number;
}

export interface ActiveOp {
  defId: string;
  heroIds: string[];
  startedAt: number;
  endsAt: number;
  /** Squad went out with full kit — worth EQUIPPED_BONUS on the payout. */
  equipped: boolean;
}

export interface GameState {
  // Currencies
  verba: Decimal;
  /** Reset every restructuring — drives the Dossiê payout. */
  totalVerbaThisRun: Decimal;
  /** Never reset — drives commendations. */
  lifetimeVerba: Decimal;
  dossies: Decimal;
  /** Non-exponential support resources produced by the departments. */
  intel: number;
  equipamento: number;

  // Roster
  levels: Record<string, number>;
  /** heroId -> department id. Unlisted heroes fall back to patrol. */
  assignments: Record<string, string>;

  // Campaign
  threat: number;
  maxThreat: number;

  // Progression systems
  upgrades: string[]; // wiped on restructuring
  protocols: Record<string, number>; // permanent
  achievements: string[]; // permanent

  // Field operations
  activeOps: ActiveOp[];
  opCooldowns: Record<string, number>;

  // Stats
  totalDispatches: number; // legacy counter, no longer increments
  restructurings: number;
  alertsClaimed: number;
  opsCompleted: number;
  runStart: number;

  /** Tabs the player has already opened — drives the "novo" marker. */
  seenTabs: string[];

  // Settings
  autoTrain: boolean;
  /** Fraction of Verba the automation may spend on a single purchase. */
  autoSpendFraction: number;

  lastTick: number;
}

const SAVE_KEY = "ociosos-save-v5";
const LEGACY_KEYS = ["ociosos-save-v4", "ociosos-save-v3"];
const TICK_MS = 100;
const AUTOSAVE_MS = 5_000;

/**
 * The agency's baseline budget. Without it a fresh save has zero heroes, zero
 * production and no way to ever afford the first one — the game simply never
 * starts. Deliberately flat and unscaled, so it bootstraps the opening minutes
 * and then fades into irrelevance instead of compounding forever.
 */
/**
 * No income before the first enlistment. The free starter hero is what boots
 * the economy, so the agency produces exactly nothing until the player acts.
 */
export const BASE_VERBA_PER_SECOND = 0;

const OFFLINE_RATE = 0.7;
const BASE_OFFLINE_CAP_H = 12;

// --- Stores ---------------------------------------------------------------

export const activeBuff = writable<ActiveBuff | null>(null);
export const alerta = writable<Alerta | null>(null);
export const offlineReport = writable<{ ms: number; gained: Decimal } | null>(null);
export const threatEvent = writable<{ name: string; emoji: string; level: number; reward: Decimal } | null>(null);
export const toast = writable<{ id: number; text: string; tone: "gold" | "red" | "green" } | null>(null);

let toastId = 0;
export function pushToast(text: string, tone: "gold" | "red" | "green" = "gold") {
  toast.set({ id: toastId++, text, tone });
}

// --- Save/load ------------------------------------------------------------

function freshLevels(): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const h of HEROES) levels[h.id] = 0;
  return levels;
}

function freshState(): GameState {
  return {
    verba: new Decimal(0),
    totalVerbaThisRun: new Decimal(0),
    lifetimeVerba: new Decimal(0),
    dossies: new Decimal(0),
    intel: 0,
    equipamento: 0,
    levels: freshLevels(),
    assignments: {},
    threat: 1,
    maxThreat: 1,
    upgrades: [],
    protocols: {},
    achievements: [],
    activeOps: [],
    opCooldowns: {},
    totalDispatches: 0,
    restructurings: 0,
    alertsClaimed: 0,
    opsCompleted: 0,
    runStart: Date.now(),
    seenTabs: [],
    autoTrain: false,
    autoSpendFraction: 0.5,
    lastTick: Date.now(),
  };
}

function serialize(s: GameState): string {
  return JSON.stringify({
    v: 5,
    verba: s.verba.toString(),
    totalVerbaThisRun: s.totalVerbaThisRun.toString(),
    lifetimeVerba: s.lifetimeVerba.toString(),
    dossies: s.dossies.toString(),
    intel: s.intel,
    equipamento: s.equipamento,
    levels: s.levels,
    assignments: s.assignments,
    threat: s.threat,
    maxThreat: s.maxThreat,
    upgrades: s.upgrades,
    protocols: s.protocols,
    achievements: s.achievements,
    activeOps: s.activeOps,
    opCooldowns: s.opCooldowns,
    totalDispatches: s.totalDispatches,
    restructurings: s.restructurings,
    alertsClaimed: s.alertsClaimed,
    opsCompleted: s.opsCompleted,
    runStart: s.runStart,
    seenTabs: s.seenTabs,
    autoTrain: s.autoTrain,
    autoSpendFraction: s.autoSpendFraction,
    lastTick: Date.now(),
  });
}

/** Old save keys, mapped onto the agency vocabulary so testers keep progress. */
const LEGACY_PROTOCOL_IDS: Record<string, string> = {
  acervo: "arquivo",
  roteiro: "doutrina",
  soco: "resposta",
  herdeiro: "instalacao",
  elenco: "quadro",
  "hora-extra": "turno-noturno",
  manchete: "escuta",
  piloto: "autonomo",
  sindicato: "interdepartamental",
};

function sanitizeAssignments(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof raw !== "object" || !raw) return out;
  for (const [heroId, deptId] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof deptId === "string" && deptId in DEPARTMENTS_BY_ID) out[heroId] = deptId;
  }
  return out;
}

function deserialize(raw: string): GameState {
  const p = JSON.parse(raw);
  const base = freshState();
  const levels = freshLevels();
  for (const id of Object.keys(levels)) {
    if (typeof p.levels?.[id] === "number") levels[id] = p.levels[id];
  }

  const protocols: Record<string, number> = {};
  const rawProtocols = p.protocols ?? p.retcons ?? {};
  for (const [k, v] of Object.entries(rawProtocols)) {
    if (typeof v !== "number") continue;
    protocols[LEGACY_PROTOCOL_IDS[k] ?? k] = v;
  }

  const activeOps: ActiveOp[] = Array.isArray(p.activeOps)
    ? p.activeOps.filter(
        (o: ActiveOp) => o && typeof o.defId === "string" && o.defId in OPERATIONS_BY_ID && Array.isArray(o.heroIds),
      )
    : [];

  return {
    verba: new Decimal(p.verba ?? p.fama ?? 0),
    totalVerbaThisRun: new Decimal(p.totalVerbaThisRun ?? p.totalFamaThisRun ?? 0),
    lifetimeVerba: new Decimal(p.lifetimeVerba ?? p.lifetimeFama ?? 0),
    dossies: new Decimal(p.dossies ?? p.fragmentos ?? 0),
    intel: typeof p.intel === "number" ? p.intel : 0,
    equipamento: typeof p.equipamento === "number" ? p.equipamento : 0,
    levels,
    assignments: sanitizeAssignments(p.assignments),
    threat: p.threat ?? p.edition ?? 1,
    maxThreat: p.maxThreat ?? p.maxEdition ?? p.threat ?? p.edition ?? 1,
    upgrades: Array.isArray(p.upgrades) ? p.upgrades.filter((u: string) => u in UPGRADES_BY_ID) : [],
    protocols,
    achievements: Array.isArray(p.achievements) ? p.achievements : [],
    activeOps,
    opCooldowns: typeof p.opCooldowns === "object" && p.opCooldowns ? p.opCooldowns : {},
    totalDispatches: p.totalDispatches ?? p.totalClicks ?? 0,
    restructurings: p.restructurings ?? p.reboots ?? 0,
    alertsClaimed: p.alertsClaimed ?? p.manchetesClicked ?? 0,
    opsCompleted: p.opsCompleted ?? 0,
    runStart: p.runStart ?? base.runStart,
    seenTabs: Array.isArray(p.seenTabs) ? p.seenTabs : [],
    autoTrain: !!p.autoTrain,
    autoSpendFraction: typeof p.autoSpendFraction === "number" ? p.autoSpendFraction : 0.5,
    lastTick: typeof p.lastTick === "number" ? p.lastTick : Date.now(),
  };
}

function loadSave(): { state: GameState; offlineMs: number } {
  if (typeof localStorage === "undefined") return { state: freshState(), offlineMs: 0 };
  let raw = localStorage.getItem(SAVE_KEY);
  for (const key of LEGACY_KEYS) {
    if (raw) break;
    raw = localStorage.getItem(key);
  }
  if (!raw) return { state: freshState(), offlineMs: 0 };
  try {
    const state = deserialize(raw);
    const offlineMs = Math.max(0, Date.now() - state.lastTick);
    state.lastTick = Date.now();
    return { state, offlineMs };
  } catch {
    return { state: freshState(), offlineMs: 0 };
  }
}

// --- Multipliers ----------------------------------------------------------

export function protocolLevel(s: GameState, id: string): number {
  return s.protocols[id] ?? 0;
}

export function assignedDepartment(s: GameState, heroId: string): string {
  const id = s.assignments[heroId];
  return id && id in DEPARTMENTS_BY_ID ? id : DEFAULT_DEPARTMENT;
}

export function departmentSlots(s: GameState, def: DepartmentDef): number {
  if (def.unlimited) return Infinity;
  return def.baseSlots + protocolLevel(s, "estrutura");
}

export function heroesInDepartment(s: GameState, deptId: string): string[] {
  return HEROES.filter(
    (h) => (s.levels[h.id] ?? 0) > 0 && !isDeployed(s, h.id) && assignedDepartment(s, h.id) === deptId,
  ).map((h) => h.id);
}

export function departmentUnlocked(s: GameState, def: DepartmentDef): boolean {
  return s.maxThreat >= def.minThreat && totalRecruited(s) >= def.minHeroes;
}

/**
 * Systems arrive one at a time instead of all six tabs greeting a new player.
 * Each gate is placed just after the thing that makes the tab make sense.
 */
export function tabUnlocked(s: GameState, id: string): boolean {
  switch (id) {
    case "efetivo":
      return true;
    case "operacoes":
      return s.intel > 0 || s.opsCompleted > 0 || s.activeOps.length > 0;
    case "melhorias":
      return s.maxThreat >= 2;
    case "protocolos":
      return s.dossies.gt(0) || s.restructurings > 0 || s.totalVerbaThisRun.gte(100_000);
    case "condecoracoes":
      return s.achievements.length > 0;
    case "stats":
      return s.maxThreat >= 3;
    default:
      return true;
  }
}

export function markTabSeen(id: string): void {
  game.update((s) => (s.seenTabs.includes(id) ? s : { ...s, seenTabs: [...s.seenTabs, id] }));
}

/** Moves a hero to a post, refusing if the department is already full. */
export function assignHero(heroId: string, deptId: string): boolean {
  const s = get(game);
  const def = DEPARTMENTS_BY_ID[deptId];
  if (!def || !departmentUnlocked(s, def)) return false;
  if ((s.levels[heroId] ?? 0) <= 0 || isDeployed(s, heroId)) return false;
  if (assignedDepartment(s, heroId) === deptId) return true;
  if (heroesInDepartment(s, deptId).length >= departmentSlots(s, def)) return false;
  game.update((st) => ({ ...st, assignments: { ...st.assignments, [heroId]: deptId } }));
  return true;
}

export function isDeployed(s: GameState, heroId: string): boolean {
  return s.activeOps.some((op) => op.heroIds.includes(heroId));
}

function recruitedInFaction(s: GameState, faction: Faction): number {
  return HEROES.filter((h) => h.faction === faction && (s.levels[h.id] ?? 0) > 0).length;
}

export function totalRecruited(s: GameState): number {
  return HEROES.filter((h) => (s.levels[h.id] ?? 0) > 0).length;
}

/** +15% to every hero of a faction for each teammate beyond the first. */
export function factionSynergy(s: GameState, faction: Faction): number {
  return 1 + 0.15 * Math.max(0, recruitedInFaction(s, faction) - 1);
}

function upgradeMultFor(s: GameState, kind: "global"): number {
  let mult = 1;
  for (const id of s.upgrades) {
    const u = UPGRADES_BY_ID[id];
    if (!u) continue;
    if (kind === "global" && u.kind === "global") mult *= u.mult;
  }
  return mult;
}

function heroUpgradeMult(s: GameState, heroId: string): number {
  let mult = 1;
  for (const id of s.upgrades) {
    const u = UPGRADES_BY_ID[id];
    if (u && u.kind === "hero" && u.heroId === heroId) mult *= u.mult;
  }
  return mult;
}

export function achievementMult(s: GameState): number {
  return 1 + ACHIEVEMENT_BONUS * s.achievements.length;
}

/** Everything that scales the whole agency at once. */
export function globalMultiplier(s: GameState, buff: ActiveBuff | null): Decimal {
  let m = new Decimal(1);
  m = m.times(1 + 0.25 * protocolLevel(s, "doutrina"));
  m = m.times(threatMultiplier(s.maxThreat));
  m = m.times(achievementMult(s));
  m = m.times(upgradeMultFor(s, "global"));
  const sinergia = protocolLevel(s, "interdepartamental");
  if (sinergia > 0) m = m.times(1 + 0.03 * sinergia * totalRecruited(s));
  if (buff && buff.kind === "forca") m = m.times(buff.mult);
  return m;
}

/** What a hero produces ignoring deployment — used for operation payouts. */
export function heroOutputRaw(s: GameState, def: HeroDef, buff: ActiveBuff | null): Decimal {
  const level = s.levels[def.id] ?? 0;
  if (level <= 0) return new Decimal(0);
  return new Decimal(def.baseProduction)
    .times(level)
    .times(milestoneMultiplier(level))
    .times(heroUpgradeMult(s, def.id))
    .times(factionSynergy(s, def.faction))
    .times(globalMultiplier(s, buff));
}

/**
 * Verba only comes from Patrulha. A hero posted to a department is producing
 * something else, and a deployed hero is producing nothing at all — that
 * trade-off is what makes the posting decision matter.
 */
export function heroOutput(s: GameState, def: HeroDef, buff: ActiveBuff | null): Decimal {
  if (isDeployed(s, def.id)) return new Decimal(0);
  if (assignedDepartment(s, def.id) !== DEFAULT_DEPARTMENT) return new Decimal(0);
  return heroOutputRaw(s, def, buff);
}

function departmentRate(s: GameState, deptId: string, rate: (level: number) => number): number {
  let total = 0;
  for (const h of HEROES) {
    const level = s.levels[h.id] ?? 0;
    if (level <= 0 || isDeployed(s, h.id)) continue;
    if (assignedDepartment(s, h.id) === deptId) total += rate(level);
  }
  return total;
}

export function intelPerSecond(s: GameState): number {
  return departmentRate(s, "investigacao", intelRate);
}

export function equipPerSecond(s: GameState): number {
  return departmentRate(s, "logistica", equipRate);
}

export function totalProduction(s: GameState, buff: ActiveBuff | null): Decimal {
  let total = new Decimal(BASE_VERBA_PER_SECOND);
  for (const h of HEROES) total = total.plus(heroOutput(s, h, buff));
  return total;
}

/**
 * Total Verba/s the agency would gain from buying `n` levels of this hero.
 * Measured on total production so it captures faction-synergy spillover.
 */
export function purchaseImpact(
  s: GameState,
  def: HeroDef,
  n: number,
  buff: ActiveBuff | null,
  baseTotal?: Decimal,
): Decimal {
  if (n <= 0) return new Decimal(0);
  const level = s.levels[def.id] ?? 0;
  const before = baseTotal ?? totalProduction(s, buff);
  const next: GameState = { ...s, levels: { ...s.levels, [def.id]: level + n } };
  return totalProduction(next, buff).minus(before);
}

export function offlineCapMs(s: GameState): number {
  return (BASE_OFFLINE_CAP_H + 2 * protocolLevel(s, "turno-noturno")) * 3_600_000;
}

// --- Costs ----------------------------------------------------------------

function firstIsFree(def: HeroDef, level: number): boolean {
  return level === 0 && !!def.freeRecruit;
}

export function heroCost(def: HeroDef, level: number): Decimal {
  if (firstIsFree(def, level)) return new Decimal(0);
  return new Decimal(def.recruitCost).times(Decimal.pow(def.costRate, level)).ceil();
}

export function heroCostBulk(def: HeroDef, level: number, n: number): Decimal {
  if (n <= 0) return new Decimal(0);
  // The free enlistment covers level 0 only; everything above it is priced
  // from level 1 as usual.
  if (firstIsFree(def, level)) {
    if (n === 1) return new Decimal(0);
    return Decimal.sumGeometricSeries(n - 1, def.recruitCost, def.costRate, 1).ceil();
  }
  return Decimal.sumGeometricSeries(n, def.recruitCost, def.costRate, level).ceil();
}

export function maxAffordableLevels(def: HeroDef, level: number, verba: Decimal): number {
  if (firstIsFree(def, level)) {
    const rest = Decimal.affordGeometricSeries(verba, def.recruitCost, def.costRate, 1).toNumber();
    return 1 + Math.max(0, Math.floor(rest));
  }
  const n = Decimal.affordGeometricSeries(verba, def.recruitCost, def.costRate, level).toNumber();
  return Math.max(0, Math.floor(n));
}

export function levelsToBuy(def: HeroDef, level: number, verba: Decimal, amount: BuyAmount): number {
  const affordable = maxAffordableLevels(def, level, verba);
  if (amount === "max") return affordable;
  return Math.min(amount, affordable);
}

// --- Store bootstrap ------------------------------------------------------

const { state: initialState, offlineMs } = loadSave();

export const game = writable<GameState>(initialState);

export const production = derived([game, activeBuff], ([$g, $b]) => totalProduction($g, $b));
export const globalMult = derived([game, activeBuff], ([$g, $b]) => globalMultiplier($g, $b));
export const intelFlow = derived(game, ($g) => intelPerSecond($g));
export const equipFlow = derived(game, ($g) => equipPerSecond($g));

if (offlineMs > 1_000) {
  const prod = totalProduction(initialState, null);
  const capped = Math.min(offlineMs, offlineCapMs(initialState));
  const gained = prod.times(capped / 1000).times(OFFLINE_RATE);
  const offSecs = capped / 1000;
  if (gained.gt(0) || intelPerSecond(initialState) > 0 || equipPerSecond(initialState) > 0) {
    game.update((s) => ({
      ...s,
      verba: s.verba.plus(gained),
      totalVerbaThisRun: s.totalVerbaThisRun.plus(gained),
      lifetimeVerba: s.lifetimeVerba.plus(gained),
      intel: s.intel + intelPerSecond(s) * offSecs * OFFLINE_RATE,
      equipamento: s.equipamento + equipPerSecond(s) * offSecs * OFFLINE_RATE,
    }));
    offlineReport.set({ ms: capped, gained });
  }
}

// --- Actions --------------------------------------------------------------

function earn(s: GameState, amount: Decimal): GameState {
  return {
    ...s,
    verba: s.verba.plus(amount),
    totalVerbaThisRun: s.totalVerbaThisRun.plus(amount),
    lifetimeVerba: s.lifetimeVerba.plus(amount),
  };
}

export function trainHero(id: string, amount: BuyAmount = 1): void {
  game.update((s) => {
    const def = HEROES_BY_ID[id];
    if (!def) return s;
    const level = s.levels[id] ?? 0;
    const n = levelsToBuy(def, level, s.verba, amount);
    if (n <= 0) return s;
    const cost = heroCostBulk(def, level, n);
    if (s.verba.lt(cost)) return s;
    return { ...s, verba: s.verba.minus(cost), levels: { ...s.levels, [id]: level + n } };
  });
}

export function upgradeContext(s: GameState): UpgradeContext {
  return { levels: s.levels, threat: s.maxThreat, totalDispatches: s.totalDispatches };
}

export function availableUpgrades(s: GameState) {
  const ctx = upgradeContext(s);
  return UPGRADES.filter((u) => !s.upgrades.includes(u.id) && u.unlocked(ctx));
}

export function buyUpgrade(id: string): void {
  game.update((s) => {
    const u = UPGRADES_BY_ID[id];
    if (!u || s.upgrades.includes(id)) return s;
    if (!u.unlocked(upgradeContext(s))) return s;
    if (s.verba.lt(u.cost)) return s;
    return { ...s, verba: s.verba.minus(u.cost), upgrades: [...s.upgrades, id] };
  });
}

export function buyProtocol(id: string): void {
  game.update((s) => {
    const def = PROTOCOLS_BY_ID[id];
    if (!def) return s;
    const level = s.protocols[id] ?? 0;
    if (level >= def.maxLevel) return s;
    const cost = protocolCost(def, level);
    if (s.dossies.lt(cost)) return s;
    return { ...s, dossies: s.dossies.minus(cost), protocols: { ...s.protocols, [id]: level + 1 } };
  });
}

// --- Restructuring (prestige) ---------------------------------------------

export function currentDossieCap(s: GameState): number {
  return dossieCap(protocolLevel(s, "arquivo"));
}

export function pendingDossies(s: GameState): Decimal {
  return dossiesFor(s.totalVerbaThisRun, currentDossieCap(s));
}

export function atDossieCap(s: GameState): boolean {
  return pendingDossies(s).gte(currentDossieCap(s));
}

/** 0..1 fill toward the next Dossiê, or full once the ceiling is reached. */
export function dossieProgress(s: GameState): number {
  if (atDossieCap(s)) return 1;
  const raw = dossiesRaw(s.totalVerbaThisRun);
  return Math.max(0, Math.min(1, raw - Math.floor(raw)));
}

export function canRestructure(s: GameState): boolean {
  return pendingDossies(s).gt(0);
}

export function doRestructure(): void {
  game.update((s) => {
    if (!canRestructure(s)) return s;
    const gained = pendingDossies(s);

    const seats = protocolLevel(s, "quadro");
    const levels = freshLevels();
    for (let i = 0; i < Math.min(seats, HEROES.length); i++) levels[HEROES[i].id] = 1;

    return {
      ...s,
      verba: seedVerba(protocolLevel(s, "instalacao")),
      totalVerbaThisRun: new Decimal(0),
      dossies: s.dossies.plus(gained),
      intel: 0,
      equipamento: 0,
      levels,
      assignments: {},
      threat: 1,
      upgrades: [],
      activeOps: [],
      opCooldowns: {},
      restructurings: s.restructurings + 1,
      runStart: Date.now(),
    };
  });
  activeBuff.set(null);
  alerta.set(null);
}

export function setAutoTrain(on: boolean): void {
  game.update((s) => ({ ...s, autoTrain: on }));
}

export function setAutoSpendFraction(f: number): void {
  game.update((s) => ({ ...s, autoSpendFraction: Math.min(1, Math.max(0.05, f)) }));
}

// --- Field operations -----------------------------------------------------

export function opAvailable(s: GameState, def: OperationDef, now = Date.now()): boolean {
  if (s.maxThreat < def.minThreat) return false;
  if (s.activeOps.some((o) => o.defId === def.id)) return false;
  return (s.opCooldowns[def.id] ?? 0) <= now;
}

export function availableHeroes(s: GameState): HeroDef[] {
  return HEROES.filter((h) => (s.levels[h.id] ?? 0) > 0 && !isDeployed(s, h.id));
}

export function opRoleBonusApplies(def: OperationDef, heroIds: string[]): boolean {
  if (!def.preferredRole || heroIds.length === 0) return false;
  return heroIds.every((id) => HEROES_BY_ID[id]?.role === def.preferredRole);
}

/** Payout the squad would bring back, including the matching-role bonus. */
export function opPayout(
  s: GameState,
  def: OperationDef,
  heroIds: string[],
  buff: ActiveBuff | null,
  equipped = false,
): Decimal {
  let squadRate = new Decimal(0);
  for (const id of heroIds) {
    const h = HEROES_BY_ID[id];
    if (h) squadRate = squadRate.plus(heroOutputRaw(s, h, buff));
  }
  const bonus = opRoleBonusApplies(def, heroIds) ? def.roleBonus : 1;
  return squadRate.times(def.payoutSeconds).times(bonus).times(equipped ? EQUIPPED_BONUS : 1);
}

export function opDurationMs(s: GameState, def: OperationDef): number {
  const speed = 1 - 0.1 * protocolLevel(s, "resposta");
  return Math.round(def.durationMs * Math.max(0.3, speed));
}

export function deployOperation(defId: string, heroIds: string[]): boolean {
  const def = OPERATIONS_BY_ID[defId];
  const s = get(game);
  if (!def || !opAvailable(s, def)) return false;
  if (heroIds.length !== def.slots) return false;
  if (heroIds.some((id) => isDeployed(s, id) || (s.levels[id] ?? 0) <= 0)) return false;
  if (s.intel < def.intelCost) return false;

  const equipped = s.equipamento >= def.equipCost;
  const now = Date.now();
  game.update((st) => ({
    ...st,
    intel: st.intel - def.intelCost,
    equipamento: equipped ? st.equipamento - def.equipCost : st.equipamento,
    activeOps: [
      ...st.activeOps,
      { defId, heroIds, startedAt: now, endsAt: now + opDurationMs(st, def), equipped },
    ],
  }));
  return true;
}

function settleOperations(now: number, buff: ActiveBuff | null): void {
  const done = get(game).activeOps.filter((op) => now >= op.endsAt);
  if (done.length === 0) return;

  for (const op of done) {
    const def = OPERATIONS_BY_ID[op.defId];
    if (!def) continue;
    // Priced off what the squad would have produced, so a stronger squad is
    // always the better squad to send.
    const payout = opPayout(get(game), def, op.heroIds, buff, op.equipped);
    game.update((st) => ({
      ...earn(st, payout),
      activeOps: st.activeOps.filter((o) => o !== op),
      opCooldowns: { ...st.opCooldowns, [def.id]: now + def.cooldownMs },
      opsCompleted: st.opsCompleted + 1,
    }));
    pushToast(`${def.emoji} ${def.name} concluída — +${formatNumber(payout)} de Verba`, "green");
  }
}

// --- Alertas Prioritários (random buff events) ----------------------------

const ALERTA_MIN_MS = 120_000;
const ALERTA_MAX_MS = 300_000;
const ALERTA_LIFETIME_MS = 13_000;

let nextAlertaAt = Date.now() + ALERTA_MIN_MS;
let alertaId = 0;

function scheduleAlerta(s: GameState): void {
  const speed = 1 - 0.2 * protocolLevel(s, "escuta");
  const span = ALERTA_MIN_MS + Math.random() * (ALERTA_MAX_MS - ALERTA_MIN_MS);
  nextAlertaAt = Date.now() + span * Math.max(0.2, speed);
}

function spawnAlerta(): void {
  alerta.set({
    id: alertaId++,
    x: 12 + Math.random() * 70,
    y: 15 + Math.random() * 65,
    expiresAt: Date.now() + ALERTA_LIFETIME_MS,
  });
}

export function claimAlerta(): void {
  if (!get(alerta)) return;
  alerta.set(null);

  const s = get(game);
  const durationScale = 1 + 0.25 * protocolLevel(s, "escuta");
  const roll = Math.random();

  if (roll < 0.6) {
    activeBuff.set({
      kind: "forca",
      label: "Força-tarefa ×7",
      mult: 7,
      until: Date.now() + 60_000 * durationScale,
    });
    pushToast("Força-tarefa mobilizada: produção ×7 por 60s", "gold");
  } else {
    const lump = totalProduction(s, null).times(900).max(new Decimal(50));
    game.update((st) => earn(st, lump));
    pushToast(`Apreensão de recursos: +${formatNumber(lump)} de Verba`, "green");
  }

  game.update((st) => ({ ...st, alertsClaimed: st.alertsClaimed + 1 }));
  scheduleAlerta(get(game));
}

// --- Auto-train -----------------------------------------------------------

function bestAutoBuy(s: GameState, buff: ActiveBuff | null): string | null {
  let bestId: string | null = null;
  let bestRatio = new Decimal(0);
  // Never drain the whole treasury: the reserve is what keeps the agency able
  // to clear the next threat instead of being permanently broke.
  const budget = s.verba.times(s.autoSpendFraction);
  for (const h of HEROES) {
    const level = s.levels[h.id] ?? 0;
    const cost = heroCost(h, level);
    if (budget.lt(cost)) continue;
    const current = heroOutputRaw(s, h, buff);
    const next: GameState = { ...s, levels: { ...s.levels, [h.id]: level + 1 } };
    const gain = heroOutputRaw(next, h, buff).minus(current);
    if (gain.lte(0)) continue;
    const ratio = gain.div(cost);
    if (ratio.gt(bestRatio)) {
      bestRatio = ratio;
      bestId = h.id;
    }
  }
  return bestId;
}

// --- Achievements ---------------------------------------------------------

function achievementContext(s: GameState): AchievementContext {
  return {
    lifetimeVerba: s.lifetimeVerba,
    levels: s.levels,
    maxThreat: s.maxThreat,
    totalDispatches: s.totalDispatches,
    restructurings: s.restructurings,
    alertsClaimed: s.alertsClaimed,
    opsCompleted: s.opsCompleted,
  };
}

function checkAchievements(): void {
  const s = get(game);
  const ctx = achievementContext(s);
  const unlocked: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements.includes(a.id) && a.check(ctx)) unlocked.push(a.id);
  }
  if (unlocked.length === 0) return;
  game.update((st) => ({ ...st, achievements: [...st.achievements, ...unlocked] }));
  const first = ACHIEVEMENTS.find((a) => a.id === unlocked[0]);
  if (first) pushToast(`Condecoração — ${first.emoji} ${first.name}`, "gold");
}

// --- Threat ladder --------------------------------------------------------

function checkThreat(buff: ActiveBuff | null): void {
  const s = get(game);
  if (!totalProduction(s, buff).gte(threatThreshold(s.threat))) return;

  const reward = threatReward(s.threat);
  const t = threatFor(s.threat);
  const cleared = s.threat;
  game.update((st) => ({
    ...earn(st, reward),
    threat: st.threat + 1,
    maxThreat: Math.max(st.maxThreat, st.threat + 1),
  }));
  threatEvent.set({ name: t.name, emoji: t.emoji, level: cleared, reward });
}

// --- Persistence ----------------------------------------------------------

function persist(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SAVE_KEY, serialize(get(game)));
}

export function exportSave(): string {
  return btoa(unescape(encodeURIComponent(serialize(get(game)))));
}

export function importSave(encoded: string): boolean {
  try {
    game.set(deserialize(decodeURIComponent(escape(atob(encoded.trim())))));
    persist();
    return true;
  } catch {
    return false;
  }
}

export function resetSave(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SAVE_KEY);
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  }
  game.set(freshState());
  activeBuff.set(null);
  alerta.set(null);
  threatEvent.set(null);
  offlineReport.set(null);
}

// --- Debug ----------------------------------------------------------------

export function debugSetVerba(value: string | number): void {
  let d: Decimal;
  try {
    d = new Decimal(value);
  } catch {
    return;
  }
  if (d.lt(0)) d = new Decimal(0);
  game.update((s) => ({ ...s, verba: d }));
}

export function debugAddVerba(delta: string | number): void {
  let d: Decimal;
  try {
    d = new Decimal(delta);
  } catch {
    return;
  }
  game.update((s) => {
    const next = s.verba.plus(d);
    const clamped = next.lt(0) ? new Decimal(0) : next;
    const diff = clamped.minus(s.verba);
    return {
      ...s,
      verba: clamped,
      totalVerbaThisRun: diff.gt(0) ? s.totalVerbaThisRun.plus(diff) : s.totalVerbaThisRun,
      lifetimeVerba: diff.gt(0) ? s.lifetimeVerba.plus(diff) : s.lifetimeVerba,
    };
  });
}

export function debugAddSupport(n: number): void {
  game.update((s) => ({ ...s, intel: s.intel + n, equipamento: s.equipamento + n }));
}

export function debugAddDossies(n: number): void {
  game.update((s) => ({ ...s, dossies: s.dossies.plus(n) }));
}

export function debugSpawnAlerta(): void {
  spawnAlerta();
}

// --- Main loop ------------------------------------------------------------

let started = false;

export function startLoop(): void {
  if (started) return;
  started = true;
  scheduleAlerta(get(game));

  setInterval(() => {
    const now = Date.now();

    const buff = get(activeBuff);
    if (buff && now >= buff.until) activeBuff.set(null);
    const liveBuff = get(activeBuff);

    game.update((s) => {
      const secs = TICK_MS / 1000;
      const gained = totalProduction(s, liveBuff).times(secs);
      return {
        ...earn(s, gained),
        intel: s.intel + intelPerSecond(s) * secs,
        equipamento: s.equipamento + equipPerSecond(s) * secs,
        lastTick: now,
      };
    });

    settleOperations(now, liveBuff);

    const a = get(alerta);
    if (a && now >= a.expiresAt) {
      alerta.set(null);
      scheduleAlerta(get(game));
    } else if (!a && now >= nextAlertaAt) {
      spawnAlerta();
    }

    const s = get(game);
    if (s.autoTrain && protocolLevel(s, "autonomo") > 0) {
      const pick = bestAutoBuy(s, liveBuff);
      if (pick) trainHero(pick, 1);
    }

    checkThreat(liveBuff);
    checkAchievements();
  }, TICK_MS);

  setInterval(persist, AUTOSAVE_MS);

  if (typeof window !== "undefined") window.addEventListener("beforeunload", persist);
}
