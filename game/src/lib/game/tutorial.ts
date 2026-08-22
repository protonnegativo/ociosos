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
  /** Depends on the anchor, so the wording follows a moving target. */
  title: (a: TutorialContext) => string;
  tab: string;
  reward: TutorialReward;
  lesson: string;
  /** `a` is the snapshot from when this step became the current one. */
  progress: (c: TutorialContext, a: TutorialContext) => { current: number; target: number };
  done: (c: TutorialContext, a: TutorialContext) => boolean;
}

const MILESTONES = [10, 25, 50, 100, 200, 400, 700, 1000];

function nextMilestoneAbove(level: number): number {
  for (const m of MILESTONES) if (level < m) return m;
  return MILESTONES[MILESTONES.length - 1];
}

/**
 * Targets are relative to the anchor so a step can never arrive already
 * satisfied. Absolute goals read fine on paper, but players routinely blew past
 * "reach level 10" long before that step came up, turning its lesson into a
 * button that showed up pre-completed.
 */
export const TUTORIAL: TutorialStep[] = [
  {
    id: "enlist",
    title: () => "Aliste seu primeiro herói — o alistamento dele é gratuito",
    tab: "efetivo",
    reward: { verba: 20 },
    lesson:
      "Herói alistado entra na Patrulha e passa a render Verba sozinho. Toda a economia da agência nasce daí — não existe nada para clicar.",
    progress: (c) => ({ current: Math.min(c.recruited, 1), target: 1 }),
    done: (c) => c.recruited >= 1,
  },
  {
    id: "train",
    title: (a) => `Treine um herói até o nível ${Math.max(5, a.maxLevel + 3)}`,
    tab: "efetivo",
    reward: { verba: 60 },
    lesson:
      "Cada nível soma produção, mas o custo do próximo sobe junto. Em algum momento vale mais alistar alguém novo do que insistir no mesmo herói.",
    progress: (c, a) => {
      const t = Math.max(5, a.maxLevel + 3);
      return { current: Math.min(c.maxLevel, t), target: t };
    },
    done: (c, a) => c.maxLevel >= Math.max(5, a.maxLevel + 3),
  },
  {
    id: "second",
    title: (a) => `Aliste outro herói — chegue a ${Math.max(2, a.recruited + 1)} no efetivo`,
    tab: "efetivo",
    reward: { verba: 150 },
    lesson:
      "Heróis mais caros rendem muito mais, porém demoram bem mais para se pagar. O botão mostra o ganho que a compra traz para a agência.",
    progress: (c, a) => {
      const t = Math.max(2, a.recruited + 1);
      return { current: Math.min(c.recruited, t), target: t };
    },
    done: (c, a) => c.recruited >= Math.max(2, a.recruited + 1),
  },
  {
    id: "assign",
    title: () => "Designe um herói para a Investigação, no quadro de departamentos",
    tab: "efetivo",
    reward: { verba: 120, intel: 3 },
    lesson:
      "Herói em departamento para de patrulhar: você troca Verba por outro recurso. As vagas são poucas de propósito — essa escolha é o centro do jogo.",
    progress: (c) => ({ current: Math.min(c.investigating, 1), target: 1 }),
    done: (c) => c.investigating >= 1,
  },
  {
    id: "intel",
    title: (a) => `Acumule ${Math.max(5, Math.floor(a.intel) + 5)} de Intel`,
    tab: "efetivo",
    reward: { verba: 300 },
    lesson:
      "Intel só vem da Investigação e é gasta para lançar operações. Sem ninguém investigando, nenhuma equipe sai a campo.",
    progress: (c, a) => {
      const t = Math.max(5, Math.floor(a.intel) + 5);
      return { current: Math.min(Math.floor(c.intel), t), target: t };
    },
    done: (c, a) => c.intel >= Math.max(5, Math.floor(a.intel) + 5),
  },
  {
    id: "operation",
    title: () => "Monte uma equipe e conclua uma operação de campo",
    tab: "operacoes",
    reward: { verba: 800, equipamento: 5 },
    lesson:
      "Operação rende bem mais que patrulha no mesmo tempo, mas ocupa a equipe: quem está em campo não produz nada. Com Equipamento, o retorno é 1,5x.",
    progress: (c, a) => ({ current: Math.min(c.opsCompleted - a.opsCompleted, 1), target: 1 }),
    done: (c, a) => c.opsCompleted > a.opsCompleted,
  },
  {
    id: "threat",
    title: (a) => `Neutralize a Ameaça nível ${a.maxThreat}`,
    tab: "efetivo",
    reward: { verba: 2_000 },
    lesson:
      "Ameaças caem sozinhas quando a produção da agência alcança o limiar. Cada uma vencida aumenta em definitivo o rendimento de todo o efetivo.",
    progress: (c, a) => ({ current: Math.min(c.maxThreat - a.maxThreat, 1), target: 1 }),
    done: (c, a) => c.maxThreat > a.maxThreat,
  },
  {
    id: "upgrade",
    title: () => "Compre uma melhoria para toda a agência",
    tab: "melhorias",
    reward: { verba: 5_000 },
    lesson:
      "Melhorias multiplicam tudo, mas valem só para a administração atual: somem quando você reestrutura. Quanto antes comprar, mais tempo elas rendem.",
    progress: (c, a) => ({ current: Math.min(c.upgrades - a.upgrades, 1), target: 1 }),
    done: (c, a) => c.upgrades > a.upgrades,
  },
  {
    id: "milestone",
    title: (a) => `Leve um herói ao nível ${nextMilestoneAbove(a.maxLevel)} e ganhe um marco ×2`,
    tab: "efetivo",
    reward: { verba: 15_000, intel: 10 },
    lesson:
      "Nos marcos (10, 25, 50, 100...) o herói dobra a produção. Vale concentrar treino em quem está perto de um marco em vez de espalhar.",
    progress: (c, a) => {
      const t = nextMilestoneAbove(a.maxLevel);
      return { current: Math.min(c.maxLevel, t), target: t };
    },
    done: (c, a) => c.maxLevel >= nextMilestoneAbove(a.maxLevel),
  },
  {
    id: "third",
    title: (a) => `Aliste mais um herói — chegue a ${Math.max(3, a.recruited + 1)} no efetivo`,
    tab: "efetivo",
    reward: { verba: 40_000, intel: 15, equipamento: 10 },
    lesson:
      "É isso. Daqui em diante: Protocolos são melhorias permanentes pagas com Dossiês, e Reestruturar troca todo o progresso atual por eles. O resto você descobre jogando.",
    progress: (c, a) => {
      const t = Math.max(3, a.recruited + 1);
      return { current: Math.min(c.recruited, t), target: t };
    },
    done: (c, a) => c.recruited >= Math.max(3, a.recruited + 1),
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
