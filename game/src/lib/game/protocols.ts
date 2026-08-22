import Decimal from "break_infinity.js";

export interface ProtocolDef {
  id: string;
  name: string;
  desc: (level: number) => string;
  emoji: string;
  baseCost: number;
  costRate: number;
  maxLevel: number;
  /** Which Protocolo has to be activated (level 1+) before this one shows up at all. Undefined = visible from the start. */
  requires?: string;
}

/**
 * How many Dossiês a single administration can yield. Starts at 1 — the first
 * restructuring is deliberately a trickle — and the ceiling itself is the
 * first thing worth investing in.
 */
const DOSSIE_CAPS = [1, 10, 50, 250, 1_200, 6_000, 30_000, 150_000, 750_000, 4_000_000, 20_000_000];

export function dossieCap(arquivoLevel: number): number {
  return DOSSIE_CAPS[Math.min(Math.max(0, arquivoLevel), DOSSIE_CAPS.length - 1)];
}

export const ARQUIVO_MAX_LEVEL = DOSSIE_CAPS.length - 1;

// Bought with Dossiês. These survive every restructuring — they are the
// institutional memory that makes the next agency better than the last.
export const PROTOCOLS: ProtocolDef[] = [
  {
    id: "arquivo",
    name: "Arquivo Central",
    desc: (lv) =>
      lv >= ARQUIVO_MAX_LEVEL
        ? `Uma administração pode render até ${dossieCap(lv).toLocaleString("pt-BR")} Dossiês.`
        : `Uma administração pode render até ${dossieCap(lv).toLocaleString("pt-BR")} Dossiês. Depois: ${dossieCap(lv + 1).toLocaleString("pt-BR")}.`,
    emoji: "🗄️",
    baseCost: 1,
    costRate: 5,
    maxLevel: ARQUIVO_MAX_LEVEL,
  },
  {
    id: "doutrina",
    name: "Doutrina de Campo",
    desc: (lv) => `Produção do efetivo +25% por nível. Atual: +${lv * 25}%`,
    emoji: "📘",
    baseCost: 1,
    costRate: 1.6,
    maxLevel: 200,
    requires: "arquivo",
  },
  {
    id: "estrutura",
    name: "Estrutura Departamental",
    desc: (lv) => `+${lv} vaga por departamento. Investigação: ${2 + lv} · Logística: ${1 + lv}`,
    emoji: "🏛️",
    baseCost: 4,
    costRate: 3.2,
    maxLevel: 8,
    requires: "doutrina",
  },
  {
    id: "resposta",
    name: "Resposta Rápida",
    desc: (lv) => `Operações concluem ${lv * 10}% mais rápido.`,
    emoji: "⚡",
    baseCost: 3,
    costRate: 2.4,
    maxLevel: 7,
    requires: "doutrina",
  },
  {
    id: "escala",
    name: "Escala Departamental",
    desc: (lv) => `Intel e Equipamento rendem +20% por nível. Atual: +${lv * 20}%`,
    emoji: "📈",
    baseCost: 4,
    costRate: 2.8,
    maxLevel: 15,
    requires: "estrutura",
  },
  {
    id: "instalacao",
    name: "Verba de Instalação",
    desc: (lv) => `Cada nova administração começa com ${formatSeed(lv)} de Verba.`,
    emoji: "💰",
    baseCost: 3,
    costRate: 2,
    maxLevel: 40,
    requires: "arquivo",
  },
  {
    id: "quadro",
    name: "Quadro Permanente",
    desc: (lv) => `Os ${lv} primeiros heróis já entram alistados no nível 1.`,
    emoji: "🎖️",
    baseCost: 6,
    costRate: 3.4,
    maxLevel: 12,
    requires: "instalacao",
  },
  {
    id: "turno-noturno",
    name: "Turno Noturno",
    desc: (lv) => `Limite de rendimento offline +2h por nível. Atual: ${12 + lv * 2}h`,
    emoji: "🌙",
    baseCost: 5,
    costRate: 2.4,
    maxLevel: 6,
    requires: "instalacao",
  },
  {
    id: "escuta",
    name: "Central de Escuta",
    desc: (lv) => `Alertas Prioritários chegam ${lv * 20}% mais rápido e duram ${lv * 25}% mais.`,
    emoji: "📡",
    baseCost: 8,
    costRate: 2.6,
    maxLevel: 5,
    requires: "resposta",
  },
  {
    id: "autonomo",
    name: "Comando Autônomo",
    desc: (lv) =>
      lv >= 2
        ? "Automatiza o treinamento do efetivo e o envio de operações de campo."
        : "Automatiza o treinamento do efetivo. No nível 2, também as operações de campo.",
    emoji: "🤖",
    baseCost: 40,
    costRate: 20,
    maxLevel: 2,
    requires: "quadro",
  },
  {
    id: "interdepartamental",
    name: "Sinergia Interdepartamental",
    desc: (lv) => `Cada herói alistado dá +${lv * 3}% de produção geral.`,
    emoji: "🤝",
    baseCost: 25,
    costRate: 3,
    maxLevel: 10,
    requires: "turno-noturno",
  },
];

export const PROTOCOLS_BY_ID: Record<string, ProtocolDef> = Object.fromEntries(PROTOCOLS.map((p) => [p.id, p]));

/** Distance from a root Protocolo (no `requires`) — used to lay the reveal tree out in rows. */
export function protocolDepth(id: string): number {
  const def = PROTOCOLS_BY_ID[id];
  if (!def || !def.requires) return 0;
  return 1 + protocolDepth(def.requires);
}

export const PROTOCOL_MAX_DEPTH = Math.max(...PROTOCOLS.map((p) => protocolDepth(p.id)));

export function protocolCost(def: ProtocolDef, level: number): Decimal {
  return new Decimal(def.baseCost).times(Decimal.pow(def.costRate, level)).ceil();
}

/** Seed Verba granted by "Verba de Instalação". */
export function seedVerba(level: number): Decimal {
  if (level <= 0) return new Decimal(0);
  return new Decimal(1_000).times(Decimal.pow(12, level - 1));
}

function formatSeed(level: number): string {
  if (level <= 0) return "0";
  const v = seedVerba(level);
  return v.gte(1e6) ? v.toExponential(1) : v.toNumber().toLocaleString("pt-BR");
}

/** Verba earned this administration before a restructuring pays anything. */
export const RESTRUCTURE_THRESHOLD = new Decimal(1_000_000);

/**
 * Verba required to have earned exactly `n` Dossiês this run.
 *
 * A plain geometric ladder (base × rate^n, same shape as every other cost in
 * the game) converges to a *constant* time gap between successive Dossiês
 * once production is compounding — neither harder nor easier, just flat. A
 * smooth root of total Verba (the original formula) is worse: under
 * compounding production its time gaps actively *shrink*, so Dossiê 10 could
 * arrive faster than Dossiê 2 despite costing far more Verba.
 *
 * The n² term here is what fixes that: it makes the cost ratio between
 * consecutive Dossiês grow with n, which is what it takes to keep pace with
 * (and eventually outrun) exponential production growth. Verified by
 * simulation across several production-doubling speeds: every Dossiê after
 * the first — which is always the slowest, since it is the only one ramping
 * up from zero — takes strictly longer than the one before it.
 */
const DOSSIE_RATE = 1.5;
const DOSSIE_ACCEL = 1.03;

export function dossieVerbaNeeded(n: number): Decimal {
  if (n <= 0) return new Decimal(0);
  return RESTRUCTURE_THRESHOLD.times(Decimal.pow(DOSSIE_RATE, n)).times(Decimal.pow(DOSSIE_ACCEL, n * n));
}

/** How many Dossiês this much Verba affords — inverts dossieVerbaNeeded via the quadratic formula. */
export function dossiesFor(totalVerbaThisRun: Decimal, cap: number): Decimal {
  if (totalVerbaThisRun.lt(RESTRUCTURE_THRESHOLD)) return new Decimal(0);
  const lnRatio = totalVerbaThisRun.div(RESTRUCTURE_THRESHOLD).ln();
  const a = Math.log(DOSSIE_ACCEL);
  const b = Math.log(DOSSIE_RATE);
  const n = (-b + Math.sqrt(b * b + 4 * a * lnRatio)) / (2 * a);
  let floored = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : Number.MAX_VALUE;
  // The sqrt above loses a hair of precision right at an exact boundary
  // (Verba landing exactly on a threshold could floor to one Dossiê short).
  // Nudge in either direction against the real cost curve to correct it.
  if (Number.isFinite(floored)) {
    while (dossieVerbaNeeded(floored + 1).lte(totalVerbaThisRun)) floored++;
    while (floored > 0 && dossieVerbaNeeded(floored).gt(totalVerbaThisRun)) floored--;
  }
  return Decimal.min(new Decimal(floored), new Decimal(cap));
}

/** 0..1 progress from the current Dossiê count toward the next one. */
export function dossieStepProgress(totalVerbaThisRun: Decimal, cap: number): number {
  const earned = dossiesFor(totalVerbaThisRun, cap);
  if (earned.gte(cap)) return 1;
  const n = earned.toNumber();
  const floor = dossieVerbaNeeded(n);
  const ceil = dossieVerbaNeeded(n + 1);
  const span = ceil.minus(floor);
  if (span.lte(0)) return 0;
  return Math.max(0, Math.min(1, totalVerbaThisRun.minus(floor).div(span).toNumber()));
}
