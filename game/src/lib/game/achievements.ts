import Decimal from "break_infinity.js";
import { HEROES } from "./heroes";

export interface AchievementContext {
  lifetimeVerba: Decimal;
  levels: Record<string, number>;
  maxThreat: number;
  totalDispatches: number;
  restructurings: number;
  alertsClaimed: number;
  opsCompleted: number;
  equippedOpsCompleted: number;
  /** True if any unlocked department is currently staffed to its cap. */
  deptAtCapacity: boolean;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  check: (c: AchievementContext) => boolean;
}

/** Each unlocked trophy adds this much to the global multiplier, additively. */
export const ACHIEVEMENT_BONUS = 0.02;

function recruitedCount(levels: Record<string, number>): number {
  return HEROES.filter((h) => (levels[h.id] ?? 0) > 0).length;
}

function highestLevel(levels: Record<string, number>): number {
  return Math.max(0, ...HEROES.map((h) => levels[h.id] ?? 0));
}

const FAMA_TIERS: { id: string; name: string; amount: number; emoji: string }[] = [
  { id: "fama-1", name: "Nota de Rodapé", amount: 1_000, emoji: "📄" },
  { id: "fama-2", name: "Capa de Fanzine", amount: 1_000_000, emoji: "📰" },
  { id: "fama-3", name: "Presença Constante", amount: 1_000_000_000, emoji: "📺" },
  { id: "fama-4", name: "Ícone Pop", amount: 1e12, emoji: "🌟" },
  { id: "fama-5", name: "Lenda Viva", amount: 1e15, emoji: "🏆" },
  { id: "fama-6", name: "Mito Interdimensional", amount: 1e18, emoji: "🌌" },
];

const OPS_TIERS: { id: string; name: string; amount: number; emoji: string }[] = [
  { id: "click-a1", name: "Primeiro Expediente", amount: 5, emoji: "📋" },
  { id: "click-a2", name: "Rotina de Campo", amount: 60, emoji: "🚩" },
  { id: "click-a3", name: "Departamento Consolidado", amount: 400, emoji: "🏛️" },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  ...FAMA_TIERS.map((t) => ({
    id: t.id,
    name: t.name,
    desc: `Acumule ${t.amount.toExponential(0).replace("e+", "e")} de Verba no total.`,
    emoji: t.emoji,
    check: (c: AchievementContext) => c.lifetimeVerba.gte(t.amount),
  })),
  ...OPS_TIERS.map((t) => ({
    id: t.id,
    name: t.name,
    desc: `Conclua ${t.amount.toLocaleString("pt-BR")} operações de campo.`,
    emoji: t.emoji,
    check: (c: AchievementContext) => c.opsCompleted >= t.amount,
  })),
  {
    id: "roster-1",
    name: "Segunda Contratação",
    desc: "Aliste 2 heróis.",
    emoji: "👥",
    check: (c) => recruitedCount(c.levels) >= 2,
  },
  {
    id: "roster-2",
    name: "Formação Titular",
    desc: "Aliste 6 heróis.",
    emoji: "🧑‍🤝‍🧑",
    check: (c) => recruitedCount(c.levels) >= 6,
  },
  {
    id: "roster-3",
    name: "Elenco Completo",
    desc: `Aliste todos os ${HEROES.length} heróis.`,
    emoji: "🎬",
    check: (c) => recruitedCount(c.levels) >= HEROES.length,
  },
  {
    id: "level-1",
    name: "Treinamento Básico",
    desc: "Leve um herói ao nível 25.",
    emoji: "📈",
    check: (c) => highestLevel(c.levels) >= 25,
  },
  {
    id: "level-2",
    name: "Protagonista",
    desc: "Leve um herói ao nível 100.",
    emoji: "⭐",
    check: (c) => highestLevel(c.levels) >= 100,
  },
  {
    id: "level-3",
    name: "Personagem Principal",
    desc: "Leve um herói ao nível 250.",
    emoji: "👑",
    check: (c) => highestLevel(c.levels) >= 250,
  },
  {
    id: "edition-1",
    name: "Estreia",
    desc: "Alcance a Ameaça nível 5.",
    emoji: "📕",
    check: (c) => c.maxThreat >= 5,
  },
  {
    id: "edition-2",
    name: "Arco Consagrado",
    desc: "Alcance a Ameaça nível 15.",
    emoji: "📗",
    check: (c) => c.maxThreat >= 15,
  },
  {
    id: "edition-3",
    name: "Saga Definitiva",
    desc: "Alcance a Ameaça nível 30.",
    emoji: "📘",
    check: (c) => c.maxThreat >= 30,
  },
  {
    id: "reboot-1",
    name: "Primeira Reestruturação",
    desc: "Reestruture a agência uma vez.",
    emoji: "🔄",
    check: (c) => c.restructurings >= 1,
  },
  {
    id: "reboot-2",
    name: "Terceira Administração",
    desc: "Reestruture a agência 5 vezes.",
    emoji: "🌀",
    check: (c) => c.restructurings >= 5,
  },
  {
    id: "reboot-3",
    name: "Memória Institucional",
    desc: "Reestruture a agência 20 vezes.",
    emoji: "🤯",
    check: (c) => c.restructurings >= 20,
  },
  {
    id: "ops-1",
    name: "Primeira Missão",
    desc: "Conclua 1 operação de campo.",
    emoji: "🎯",
    check: (c) => c.opsCompleted >= 1,
  },
  {
    id: "ops-2",
    name: "Comando Experiente",
    desc: "Conclua 25 operações de campo.",
    emoji: "🎖️",
    check: (c) => c.opsCompleted >= 25,
  },
  {
    id: "ops-3",
    name: "Saída Equipada",
    desc: "Conclua uma operação com a equipe totalmente equipada.",
    emoji: "🔩",
    check: (c) => c.equippedOpsCompleted >= 1,
  },
  {
    id: "dept-1",
    name: "Departamento Lotado",
    desc: "Preencha todas as vagas de um departamento.",
    emoji: "🏢",
    check: (c) => c.deptAtCapacity,
  },
  {
    id: "manchete-1",
    name: "Furo de Reportagem",
    desc: "Atenda 10 Alertas Prioritários.",
    emoji: "📸",
    check: (c) => c.alertsClaimed >= 10,
  },
  {
    id: "manchete-2",
    name: "Fonte Preferencial",
    desc: "Atenda 100 Alertas Prioritários.",
    emoji: "🎤",
    check: (c) => c.alertsClaimed >= 100,
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
