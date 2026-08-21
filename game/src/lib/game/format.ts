import Decimal, { type DecimalSource } from "break_infinity.js";

// Standard short-scale abbreviations — the notation serious idle players
// already read fluently. Past Dc the exponent speaks for itself.
const TIERS: { exp: number; suffix: string }[] = [
  { exp: 0, suffix: "" },
  { exp: 3, suffix: "K" },
  { exp: 6, suffix: "M" },
  { exp: 9, suffix: "B" },
  { exp: 12, suffix: "T" },
  { exp: 15, suffix: "Qa" },
  { exp: 18, suffix: "Qi" },
  { exp: 21, suffix: "Sx" },
  { exp: 24, suffix: "Sp" },
  { exp: 27, suffix: "Oc" },
  { exp: 30, suffix: "No" },
  { exp: 33, suffix: "Dc" },
];

export function formatNumber(value: DecimalSource, decimals = 2): string {
  const d = Decimal.fromValue(value);
  if (d.lt(0)) return "-" + formatNumber(d.neg(), decimals);
  if (d.lt(1000)) {
    const n = d.toNumber();
    return Number.isInteger(n) ? n.toString() : n.toFixed(decimals);
  }

  const exp = Math.floor(d.e);
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (exp >= t.exp) tier = t;
    else break;
  }

  // Beyond the named tiers, fall back to scientific notation.
  if (exp >= 36) return `${d.m.toFixed(decimals)}e${exp}`;

  const mantissa = d.div(Decimal.pow(10, tier.exp)).toNumber();
  return `${mantissa.toFixed(decimals)} ${tier.suffix}`;
}

export function formatRate(value: DecimalSource): string {
  return `${formatNumber(value)}/s`;
}

/** "faltam 2min 5s" style hint for a purchase you can't afford yet. */
export function timeToAfford(cost: DecimalSource, have: DecimalSource, perSecond: DecimalSource): string | null {
  const missing = Decimal.fromValue(cost).minus(have);
  if (missing.lte(0)) return null;
  const rate = Decimal.fromValue(perSecond);
  if (rate.lte(0)) return null;
  const seconds = missing.div(rate).toNumber();
  if (!Number.isFinite(seconds)) return null;
  if (seconds > 86_400 * 365) return "muito tempo";
  return formatDuration(seconds * 1000);
}

export function formatMultiplier(value: DecimalSource): string {
  const d = Decimal.fromValue(value);
  if (d.lt(1000)) return `${d.toNumber().toFixed(2)}x`;
  return `${formatNumber(d)}x`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}
