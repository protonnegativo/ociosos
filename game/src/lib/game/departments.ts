export type Yield = "verba" | "intel" | "equipamento";

export interface DepartmentDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  yields: Yield;
  /** Posts available before the Estrutura Departamental protocol expands them. */
  baseSlots: number;
  /** Patrol is where everyone idles, so it never runs out of room. */
  unlimited?: boolean;
  minThreat: number;
  /** Heroes on the books before this post is even offered. */
  minHeroes: number;
}

// Scarcity lives here, not in the hero. Twelve heroes competing for three good
// posts is a real decision; twelve heroes with their own slot each is a
// spreadsheet you fill in once and never touch again.
export const DEPARTMENTS: DepartmentDef[] = [
  {
    id: "patrulha",
    name: "Patrulha",
    emoji: "🚔",
    desc: "Presença nas ruas. Rende Verba e é onde o efetivo fica quando não tem posto melhor.",
    yields: "verba",
    baseSlots: 0,
    unlimited: true,
    minThreat: 1,
    minHeroes: 0,
  },
  {
    id: "investigacao",
    name: "Investigação",
    emoji: "🔍",
    desc: "Levanta Intel — sem ela nenhuma operação de campo sai do papel.",
    yields: "intel",
    baseSlots: 2,
    minThreat: 1,
    minHeroes: 2,
  },
  {
    id: "logistica",
    name: "Logística",
    emoji: "🔩",
    desc: "Prepara Equipamento. Equipe bem equipada volta da operação com bem mais Verba.",
    yields: "equipamento",
    baseSlots: 1,
    minThreat: 3,
    minHeroes: 3,
  },
];

export const DEPARTMENTS_BY_ID: Record<string, DepartmentDef> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d]),
);

export const DEFAULT_DEPARTMENT = "patrulha";

/**
 * Intel and Equipamento are deliberately NOT exponential. If they scaled with
 * Verba they would overflow every operation cost within minutes and the chain
 * would stop being a constraint.
 */
export function intelRate(level: number): number {
  return 0.05 * (1 + level / 25);
}

export function equipRate(level: number): number {
  return 0.02 * (1 + level / 25);
}
