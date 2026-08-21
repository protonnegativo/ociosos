import { HEROES } from "./heroes";

export type UpgradeKind = "click" | "hero" | "global";

export interface UpgradeContext {
  levels: Record<string, number>;
  threat: number;
  totalDispatches: number;
}

export interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  kind: UpgradeKind;
  cost: number;
  mult: number;
  /** Only set for kind === "hero". */
  heroId?: string;
  emoji: string;
  reqText: string;
  unlocked: (ctx: UpgradeContext) => boolean;
}

// Bought with Fama, wiped on every Reboot — these are the *inside a run*
// power spikes that keep the mid-game from being a flat climb.

const CLICK_UPGRADES: UpgradeDef[] = [
  {
    id: "click-1",
    name: "Linha Direta",
    desc: "Cada despacho rende o dobro.",
    kind: "click",
    cost: 120,
    mult: 2,
    emoji: "👆",
    reqText: "10 despachos",
    unlocked: (c) => c.totalDispatches >= 10,
  },
  {
    id: "click-2",
    name: "Canal Prioritário",
    desc: "Cada despacho rende 3x mais.",
    kind: "click",
    cost: 9_000,
    mult: 3,
    emoji: "🥊",
    reqText: "120 despachos",
    unlocked: (c) => c.totalDispatches >= 120,
  },
  {
    id: "click-3",
    name: "Despacho Patrocinado",
    desc: "Cada despacho rende 5x mais. O logo do patrocinador é inegociável.",
    kind: "click",
    cost: 1_200_000,
    mult: 5,
    emoji: "💥",
    reqText: "600 despachos",
    unlocked: (c) => c.totalDispatches >= 600,
  },
  {
    id: "click-4",
    name: "Rede Interdimensional",
    desc: "Cada despacho rende 10x mais. Em todas as realidades, o expediente é o mesmo.",
    kind: "click",
    cost: 900_000_000,
    mult: 10,
    emoji: "🌌",
    reqText: "2.000 despachos",
    unlocked: (c) => c.totalDispatches >= 2_000,
  },
];

const GLOBAL_UPGRADES: UpgradeDef[] = [
  {
    id: "global-1",
    name: "Acordo Coletivo",
    desc: "Todo o efetivo produz 1,5x mais.",
    kind: "global",
    cost: 80_000,
    mult: 1.5,
    emoji: "📜",
    reqText: "Ameaça 3",
    unlocked: (c) => c.threat >= 3,
  },
  {
    id: "global-2",
    name: "Licenciamento de Imagem",
    desc: "Todo o efetivo produz 2x mais. Ninguém aprovou a própria estatueta.",
    kind: "global",
    cost: 15_000_000,
    mult: 2,
    emoji: "🧸",
    reqText: "Ameaça 6",
    unlocked: (c) => c.threat >= 6,
  },
  {
    id: "global-3",
    name: "Contrato de Longa-Metragem",
    desc: "Todo o efetivo produz 3x mais. Três filmes anunciados antes do primeiro roteiro existir.",
    kind: "global",
    cost: 4_000_000_000,
    mult: 3,
    emoji: "🎬",
    reqText: "Ameaça 10",
    unlocked: (c) => c.threat >= 10,
  },
  {
    id: "global-4",
    name: "Cooperação Internacional",
    desc: "Todo o efetivo produz 5x mais. O organograma agora exige um diagrama à parte.",
    kind: "global",
    cost: 2_000_000_000_000,
    mult: 5,
    emoji: "🪐",
    reqText: "Ameaça 15",
    unlocked: (c) => c.threat >= 15,
  },
  {
    id: "global-5",
    name: "Cúpula Anual de Segurança",
    desc: "Todo o efetivo produz 8x mais. Comparecimento obrigatório, resultados opcionais.",
    kind: "global",
    cost: 900_000_000_000_000,
    mult: 8,
    emoji: "💫",
    reqText: "Ameaça 21",
    unlocked: (c) => c.threat >= 21,
  },
];

// Two per hero, gated behind that hero's own level — rewards specializing.
const HERO_UPGRADES: UpgradeDef[] = HEROES.flatMap((h) => [
  {
    id: `hero-${h.id}-a`,
    name: `${h.name}: destaque em campo`,
    desc: `${h.name} produz o dobro.`,
    kind: "hero" as const,
    cost: h.recruitCost * 60,
    mult: 2,
    heroId: h.id,
    emoji: h.emoji,
    reqText: `${h.name} nível 10`,
    unlocked: (c: UpgradeContext) => (c.levels[h.id] ?? 0) >= 10,
  },
  {
    id: `hero-${h.id}-b`,
    name: `${h.name}: comando de célula`,
    desc: `${h.name} produz 3x mais.`,
    kind: "hero" as const,
    cost: h.recruitCost * 1_200,
    mult: 3,
    heroId: h.id,
    emoji: h.emoji,
    reqText: `${h.name} nível 30`,
    unlocked: (c: UpgradeContext) => (c.levels[h.id] ?? 0) >= 30,
  },
]);

export const UPGRADES: UpgradeDef[] = [...CLICK_UPGRADES, ...GLOBAL_UPGRADES, ...HERO_UPGRADES];

export const UPGRADES_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
