export interface OperationDef {
  id: string;
  name: string;
  brief: string;
  emoji: string;
  /** How many heroes must be assigned. */
  slots: number;
  durationMs: number;
  /**
   * Payout equals the squad's would-be production multiplied by this many
   * seconds. Always well above the duration, so pulling heroes off passive
   * duty is worth it — that trade is the whole decision.
   */
  payoutSeconds: number;
  /** Squads made entirely of this role earn the bonus below. */
  preferredRole?: string;
  roleBonus: number;
  cooldownMs: number;
  minThreat: number;
}

export const OPERATIONS: OperationDef[] = [
  {
    id: "escolta",
    name: "Escolta de Comboio",
    brief: "Carga sensível atravessando três distritos. Ninguém deve notar.",
    emoji: "🚚",
    slots: 2,
    durationMs: 60_000,
    payoutSeconds: 200,
    preferredRole: "Tanque",
    roleBonus: 1.5,
    cooldownMs: 90_000,
    minThreat: 1,
  },
  {
    id: "resgate",
    name: "Resgate em Prédio",
    brief: "Estrutura comprometida, civis nos andares superiores. Prioridade máxima.",
    emoji: "🏗️",
    slots: 2,
    durationMs: 90_000,
    payoutSeconds: 300,
    preferredRole: "Suporte",
    roleBonus: 1.5,
    cooldownMs: 120_000,
    minThreat: 2,
  },
  {
    id: "infiltracao",
    name: "Infiltração Silenciosa",
    brief: "Entrar, copiar os arquivos, sair. Sem registro de passagem.",
    emoji: "🕵️",
    slots: 3,
    durationMs: 150_000,
    payoutSeconds: 480,
    preferredRole: "Utilidade",
    roleBonus: 1.6,
    cooldownMs: 200_000,
    minThreat: 4,
  },
  {
    id: "contencao",
    name: "Contenção de Perímetro",
    brief: "Algo saiu do laboratório. Ainda não sabemos o quê.",
    emoji: "🚧",
    slots: 3,
    durationMs: 210_000,
    payoutSeconds: 680,
    preferredRole: "Tanque",
    roleBonus: 1.6,
    cooldownMs: 260_000,
    minThreat: 7,
  },
  {
    id: "assalto",
    name: "Assalto Coordenado",
    brief: "Base fortificada, guarnição completa. Vamos entrar pela frente.",
    emoji: "💥",
    slots: 4,
    durationMs: 300_000,
    payoutSeconds: 1_000,
    preferredRole: "Dano",
    roleBonus: 1.7,
    cooldownMs: 360_000,
    minThreat: 11,
  },
  {
    id: "bloqueio",
    name: "Bloqueio Orbital",
    brief: "Interceptar antes que entrem na atmosfera. Não há segunda tentativa.",
    emoji: "🛰️",
    slots: 4,
    durationMs: 420_000,
    payoutSeconds: 1_500,
    preferredRole: "Controle",
    roleBonus: 1.8,
    cooldownMs: 500_000,
    minThreat: 16,
  },
  {
    id: "forca-tarefa",
    name: "Força-Tarefa Conjunta",
    brief: "Todos os departamentos. Todos os recursos. Sem margem para erro.",
    emoji: "🎯",
    slots: 5,
    durationMs: 600_000,
    payoutSeconds: 2_400,
    roleBonus: 1,
    cooldownMs: 720_000,
    minThreat: 22,
  },
];

export const OPERATIONS_BY_ID: Record<string, OperationDef> = Object.fromEntries(OPERATIONS.map((o) => [o.id, o]));
