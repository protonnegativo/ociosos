import Decimal from "break_infinity.js";

export interface ProtocolDef {
  id: string;
  name: string;
  desc: (level: number) => string;
  emoji: string;
  baseCost: number;
  costRate: number;
  maxLevel: number;
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
  },
  {
    id: "resposta",
    name: "Resposta Rápida",
    desc: (lv) => `Despachos rendem 3x mais por nível. Atual: ${Math.pow(3, lv)}x`,
    emoji: "⚡",
    baseCost: 2,
    costRate: 2.2,
    maxLevel: 30,
  },
  {
    id: "instalacao",
    name: "Verba de Instalação",
    desc: (lv) => `Cada nova administração começa com ${formatSeed(lv)} de Verba.`,
    emoji: "💰",
    baseCost: 3,
    costRate: 2,
    maxLevel: 40,
  },
  {
    id: "quadro",
    name: "Quadro Permanente",
    desc: (lv) => `Os ${lv} primeiros heróis já entram alistados no nível 1.`,
    emoji: "🎖️",
    baseCost: 6,
    costRate: 3.4,
    maxLevel: 12,
  },
  {
    id: "turno-noturno",
    name: "Turno Noturno",
    desc: (lv) => `Limite de rendimento offline +2h por nível. Atual: ${12 + lv * 2}h`,
    emoji: "🌙",
    baseCost: 5,
    costRate: 2.4,
    maxLevel: 6,
  },
  {
    id: "escuta",
    name: "Central de Escuta",
    desc: (lv) => `Alertas Prioritários chegam ${lv * 20}% mais rápido e duram ${lv * 25}% mais.`,
    emoji: "📡",
    baseCost: 8,
    costRate: 2.6,
    maxLevel: 5,
  },
  {
    id: "autonomo",
    name: "Comando Autônomo",
    desc: () => "Libera o treinamento automático do efetivo.",
    emoji: "🤖",
    baseCost: 40,
    costRate: 1,
    maxLevel: 1,
  },
  {
    id: "interdepartamental",
    name: "Sinergia Interdepartamental",
    desc: (lv) => `Cada herói alistado dá +${lv * 3}% de produção geral.`,
    emoji: "🤝",
    baseCost: 25,
    costRate: 3,
    maxLevel: 10,
  },
];

export const PROTOCOLS_BY_ID: Record<string, ProtocolDef> = Object.fromEntries(PROTOCOLS.map((p) => [p.id, p]));

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

/** Uncapped payout as a plain number — its fractional part drives the bar. */
export function dossiesRaw(totalVerbaThisRun: Decimal): number {
  if (totalVerbaThisRun.lte(0)) return 0;
  const raw = totalVerbaThisRun.div(1_000_000).pow(0.6).toNumber();
  return Number.isFinite(raw) ? raw : Number.MAX_VALUE;
}

/**
 * Restructuring payout. Exponent 0.6 sits in the validated 0.5–0.8 band, with
 * the Arquivo ceiling applied on top.
 */
export function dossiesFor(totalVerbaThisRun: Decimal, cap: number): Decimal {
  if (totalVerbaThisRun.lt(RESTRUCTURE_THRESHOLD)) return new Decimal(0);
  const raw = totalVerbaThisRun.div(1_000_000).pow(0.6).floor();
  return Decimal.min(raw, new Decimal(cap));
}
