export type Faction = "Ociosos" | "Mutantes Anônimos" | "Guarda-Costas da Galáxia" | "C.H.A.T.O.";

export interface HeroDef {
  weaponName: string;
  accessoryName: string;
  id: string;
  name: string;
  flavor: string;
  faction: Faction;
  rarity: 1 | 2 | 3 | 4 | 5;
  role: string;
  emoji: string;
  /** First enlistment is on the house — the opening move shouldn't be a wait. */
  freeRecruit?: boolean;
  /** Cost to recruit at level 1; also the base for every level-up after. */
  recruitCost: number;
  /** Per-level cost growth — same exponential curve as the design doc's tier table. */
  costRate: number;
  /** Verba/s this hero adds per level owned. */
  baseProduction: number;
}

// One hero per slot — no duplicates. Leveling up *is* the "buy more" loop,
// just spent on the same named character instead of stacking clones.
export const HEROES: HeroDef[] = [
  {
    id: "rapaz-barata",
    name: "Rapaz-Barata",
    flavor: "Sobreviveu a dois cancelamentos, um reboot e uma explosão nuclear. Segue sem contrato fixo.",
    faction: "Ociosos",
    rarity: 1,
    role: "Utilidade",
    emoji: "🪳",
    freeRecruit: true,
    recruitCost: 15,
    costRate: 1.1,
    // Front-loaded on purpose: with no agency income, this hero alone carries
    // the opening minute, so it has to give the player something to spend.
    baseProduction: 0.682,
    weaponName: "Antenas de Titânio",
    accessoryName: "Casco Indestrutível",
  },
  {
    id: "torneco",
    name: "Torneco",
    flavor: "Herdou o martelo, o trono e a dívida. Só o último ainda funciona.",
    faction: "Ociosos",
    rarity: 2,
    role: "Dano",
    emoji: "🔧",
    recruitCost: 180,
    costRate: 1.11,
    baseProduction: 1.0,
    weaponName: "Martelo Energizado",
    accessoryName: "Cinto de Ferramentas",
  },
  {
    id: "alho-poro",
    name: "Capitão Alho-Poró",
    flavor: "Cresceu no espaço ouvindo a mesma fita. Chama isso de curadoria; a tripulação discorda.",
    faction: "Guarda-Costas da Galáxia",
    rarity: 2,
    role: "Dano",
    emoji: "🎧",
    recruitCost: 2_400,
    costRate: 1.11,
    baseProduction: 6.667,
    weaponName: "Walkman Laser",
    accessoryName: "Jaqueta Galáctica",
  },
  {
    id: "viuva-cinza",
    name: "Viúva Cinza",
    flavor: "Trocou espionagem por recursos humanos. Mantém os dois currículos atualizados.",
    faction: "Ociosos",
    rarity: 3,
    role: "Suporte",
    emoji: "🕶️",
    recruitCost: 32_000,
    costRate: 1.12,
    baseProduction: 53.333,
    weaponName: "Pistolas Silenciadas",
    accessoryName: "Relógio Multi-Foco",
  },
  {
    id: "capitao-brasil",
    name: "Capitão Brasil",
    flavor: "Voltou do gelo com os valores intactos e as referências de 1943. Ninguém teve coragem de atualizá-lo.",
    faction: "Ociosos",
    rarity: 3,
    role: "Tanque",
    emoji: "🛡️",
    recruitCost: 420_000,
    costRate: 1.12,
    baseProduction: 477.273,
    weaponName: "Escudo Reforçado",
    accessoryName: "Uniforme Clássico",
  },
  {
    id: "ghomme-de-ferro",
    name: "Ghomme de Ferro",
    flavor: "Banca a liga inteira e não deixa ninguém esquecer. A armadura é impecável; o humor, não.",
    faction: "Ociosos",
    rarity: 4,
    role: "Dano",
    emoji: "🦾",
    recruitCost: 6_000_000,
    costRate: 1.13,
    baseProduction: 5000.0,
    weaponName: "Repulsores Mk II",
    accessoryName: "Reator de Peito",
  },
  {
    id: "ciumento",
    name: "Ciumento",
    flavor: "Cura qualquer ferimento em segundos. Guarda rancor por décadas.",
    faction: "Mutantes Anônimos",
    rarity: 4,
    role: "Dano",
    emoji: "😾",
    recruitCost: 90_000_000,
    costRate: 1.14,
    baseProduction: 56250.0,
    weaponName: "Garras de Adamantium",
    accessoryName: "Charuto Interminável",
  },
  {
    id: "a-massa",
    name: "A Massa",
    flavor: "Passou por seis terapeutas. O sexto recomendou que ele parasse de trabalhar. Voltou no dia seguinte.",
    faction: "Ociosos",
    rarity: 5,
    role: "Tanque",
    emoji: "💪",
    recruitCost: 1_300_000_000,
    costRate: 1.15,
    baseProduction: 625000.0,
    weaponName: "Punhos Esmagadores",
    accessoryName: "Calça Indestrutível",
  },
  {
    id: "ima-neto",
    name: "Ímã-Neto",
    flavor: "Foi vilão, virou herói, virou vilão, voltou. O jurídico desistiu de acompanhar.",
    faction: "Mutantes Anônimos",
    rarity: 4,
    role: "Controle",
    emoji: "🧲",
    recruitCost: 20_000_000_000,
    costRate: 1.15,
    baseProduction: 7575757.576,
    weaponName: "Controle Magnético",
    accessoryName: "Capacete Psíquico",
  },
  {
    id: "doutor-estranhissimo",
    name: "Doutor Estranhíssimo",
    flavor: "Viu todos os futuros possíveis. Em nenhum deles a liga entrega no prazo.",
    faction: "Ociosos",
    rarity: 5,
    role: "Suporte",
    emoji: "🌀",
    recruitCost: 340_000_000_000,
    costRate: 1.16,
    baseProduction: 103658536.585,
    weaponName: "Olho Místico",
    accessoryName: "Capa Flutuante",
  },
  {
    id: "pantera-parda",
    name: "Pantera Parda",
    flavor: "Governa uma nação com tecnologia que o resto do mundo não alcança. Ainda assim comparece às reuniões.",
    faction: "Guarda-Costas da Galáxia",
    rarity: 5,
    role: "Tanque",
    emoji: "🐆",
    recruitCost: 6_000_000_000_000,
    costRate: 1.17,
    baseProduction: 1500000000.0,
    weaponName: "Garras de Vibranium",
    accessoryName: "Traje Furtivo",
  },
  {
    id: "tio-thanao",
    name: "Tio Thanão",
    flavor: "Queria cortar metade do universo por eficiência. Aceitou um cargo de consultor e faz basicamente o mesmo.",
    faction: "C.H.A.T.O.",
    rarity: 5,
    role: "Dano",
    emoji: "🧤",
    recruitCost: 120_000_000_000_000,
    costRate: 1.18,
    baseProduction: 25000000000.0,
    weaponName: "Manopla do Poder",
    accessoryName: "Trono Flutuante",
  },
];

export const HEROES_BY_ID: Record<string, HeroDef> = Object.fromEntries(HEROES.map((h) => [h.id, h]));

export const FACTION_COLOR: Record<Faction, string> = {
  "Ociosos": "var(--hero-red)",
  "Mutantes Anônimos": "var(--sky-blue)",
  "Guarda-Costas da Galáxia": "var(--power-gold)",
  "C.H.A.T.O.": "var(--villain-purple)",
};

export const ROLE_ICON: Record<string, string> = {
  "Dano": "⚔️",
  "Tanque": "🛡️",
  "Suporte": "✚",
  "Utilidade": "🔩",
  "Controle": "🌐",
};

export const FACTIONS: Faction[] = ["Ociosos", "Mutantes Anônimos", "Guarda-Costas da Galáxia", "C.H.A.T.O."];

/**
 * Level milestones grant a permanent x2 to that hero's output each.
 * Cheap to reach early, meaningful forever — the standard idle "every 25
 * levels something pops" beat.
 */
export const MILESTONES = [10, 25, 50, 100, 200, 400, 700, 1000];

export function milestoneMultiplier(level: number): number {
  let mult = 1;
  for (const m of MILESTONES) {
    if (level >= m) mult *= 2;
  }
  return mult;
}

export function nextMilestone(level: number): number | null {
  for (const m of MILESTONES) {
    if (level < m) return m;
  }
  return null;
}
