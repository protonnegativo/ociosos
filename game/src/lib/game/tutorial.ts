export interface TutorialContext {
  recruited: number;
  maxLevel: number;
  investigating: number;
  intel: number;
  equipamento: number;
  opsCompleted: number;
  activeOps: number;
  maxThreat: number;
  upgrades: number;
}

export interface TutorialReward {
  verba?: number;
  intel?: number;
  equipamento?: number;
}

export interface TutorialStep {
  id: string;
  title: string;
  /** Where the action happens, so the panel can send the player there. */
  tab: string;
  reward: TutorialReward;
  /** Progress readout, when the task is countable. */
  progress?: (c: TutorialContext) => { current: number; target: number };
  done: (c: TutorialContext) => boolean;
}

/**
 * Deliberately stops short of teaching everything. It covers the loop the
 * player cannot discover alone — posting heroes, the Intel gate, sending a
 * squad — and then gets out of the way. Protocolos, condecorações and
 * restructuring are left for the player to meet on their own.
 */
export const TUTORIAL: TutorialStep[] = [
  {
    id: "enlist",
    title: "Aliste seu primeiro herói — o alistamento dele é gratuito",
    tab: "efetivo",
    reward: { verba: 60 },
    progress: (c) => ({ current: Math.min(c.recruited, 1), target: 1 }),
    done: (c) => c.recruited >= 1,
  },
  {
    id: "train",
    title: "Treine esse herói até o nível 5",
    tab: "efetivo",
    reward: { verba: 200 },
    progress: (c) => ({ current: Math.min(c.maxLevel, 5), target: 5 }),
    done: (c) => c.maxLevel >= 5,
  },
  {
    id: "second",
    title: "Aliste um segundo herói — dois já abrem a Investigação",
    tab: "efetivo",
    reward: { verba: 600 },
    progress: (c) => ({ current: Math.min(c.recruited, 2), target: 2 }),
    done: (c) => c.recruited >= 2,
  },
  {
    id: "assign",
    title: "Designe um herói para a Investigação, no quadro de departamentos",
    tab: "efetivo",
    reward: { verba: 400, intel: 3 },
    progress: (c) => ({ current: Math.min(c.investigating, 1), target: 1 }),
    done: (c) => c.investigating >= 1,
  },
  {
    id: "intel",
    title: "Junte 5 de Intel — nenhuma operação sai sem ela",
    tab: "efetivo",
    reward: { verba: 900 },
    progress: (c) => ({ current: Math.min(Math.floor(c.intel), 5), target: 5 }),
    done: (c) => c.intel >= 5,
  },
  {
    id: "operation",
    title: "Monte uma equipe e conclua sua primeira operação de campo",
    tab: "operacoes",
    reward: { verba: 2_500, equipamento: 5 },
    progress: (c) => ({ current: Math.min(c.opsCompleted, 1), target: 1 }),
    done: (c) => c.opsCompleted >= 1,
  },
  {
    id: "threat",
    title: "Neutralize a primeira Ameaça — basta a agência produzir o bastante",
    tab: "efetivo",
    reward: { verba: 5_000 },
    progress: (c) => ({ current: Math.min(c.maxThreat - 1, 1), target: 1 }),
    done: (c) => c.maxThreat >= 2,
  },
  {
    id: "upgrade",
    title: "Compre uma melhoria para toda a agência",
    tab: "melhorias",
    reward: { verba: 12_000 },
    progress: (c) => ({ current: Math.min(c.upgrades, 1), target: 1 }),
    done: (c) => c.upgrades >= 1,
  },
  {
    id: "milestone",
    title: "Leve um herói ao nível 10 e ganhe o primeiro marco ×2",
    tab: "efetivo",
    reward: { verba: 30_000, intel: 10 },
    progress: (c) => ({ current: Math.min(c.maxLevel, 10), target: 10 }),
    done: (c) => c.maxLevel >= 10,
  },
  {
    id: "third",
    title: "Aliste um terceiro herói — daqui em diante a agência é sua",
    tab: "efetivo",
    reward: { verba: 60_000, intel: 15, equipamento: 10 },
    progress: (c) => ({ current: Math.min(c.recruited, 3), target: 3 }),
    done: (c) => c.recruited >= 3,
  },
];

export const TUTORIAL_TOTAL = TUTORIAL.length;

export function rewardText(r: TutorialReward): string {
  const parts: string[] = [];
  if (r.verba) parts.push(`${r.verba.toLocaleString("pt-BR")} Verba`);
  if (r.intel) parts.push(`${r.intel} Intel`);
  if (r.equipamento) parts.push(`${r.equipamento} Equip.`);
  return parts.join(" · ");
}
