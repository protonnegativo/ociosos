import { HEROES } from "./heroes";

export type UpgradeKind = "hero" | "global";

export interface UpgradeContext {
  levels: Record<string, number>;
  threat: number;
  totalDispatches: number;
  /** Hero ids that have cashed in their level-100 prestige. */
  prestiged: string[];
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

// Bought with Verba, wiped on every Reestruturação — these are the *inside a
// run* power spikes that keep the mid-game from being a flat climb.

// A single global-multiplier progression. This used to be two separate lists
// (an old "click upgrades" set repurposed for patrol, plus the original
// global set) that both fed the same multiplier without either one knowing
// about the other — everything reachable by Ameaça 10 compounded to ~95x for
// the price of a few purchases. One list, smaller individual multipliers,
// spread across a much wider threat range, so the total stays proportionate
// to how long it took to unlock.
const GLOBAL_UPGRADES: UpgradeDef[] = [
  {
    id: "click-1",
    name: "Escala de Turnos",
    desc: "Todo o efetivo produz 1,25x mais. Ninguém mais cobre dois turnos seguidos.",
    kind: "global",
    cost: 400,
    mult: 1.25,
    emoji: "🗓️",
    reqText: "Disponível de saída",
    unlocked: () => true,
  },
  {
    id: "click-2",
    name: "Rádio Compartilhado",
    desc: "Todo o efetivo produz 1,3x mais. A frequência é só uma, mas funciona.",
    kind: "global",
    cost: 18_000,
    mult: 1.3,
    emoji: "📻",
    reqText: "Ameaça 2",
    unlocked: (c) => c.threat >= 2,
  },
  {
    id: "global-1",
    name: "Acordo Coletivo",
    desc: "Todo o efetivo produz 1,3x mais.",
    kind: "global",
    cost: 300_000,
    mult: 1.3,
    emoji: "📜",
    reqText: "Ameaça 4",
    unlocked: (c) => c.threat >= 4,
  },
  {
    id: "click-3",
    name: "Mapeamento de Setores",
    desc: "Todo o efetivo produz 1,35x mais. Agora se sabe onde ninguém está patrulhando.",
    kind: "global",
    cost: 8_000_000,
    mult: 1.35,
    emoji: "🗺️",
    reqText: "Ameaça 7",
    unlocked: (c) => c.threat >= 7,
  },
  {
    id: "global-2",
    name: "Licenciamento de Imagem",
    desc: "Todo o efetivo produz 1,4x mais. Ninguém aprovou a própria estatueta.",
    kind: "global",
    cost: 300_000_000,
    mult: 1.4,
    emoji: "🧸",
    reqText: "Ameaça 11",
    unlocked: (c) => c.threat >= 11,
  },
  {
    id: "click-4",
    name: "Central de Despacho",
    desc: "Todo o efetivo produz 1,5x mais. Alguém finalmente coordena as chamadas.",
    kind: "global",
    cost: 20_000_000_000,
    mult: 1.5,
    emoji: "🎚️",
    reqText: "Ameaça 15",
    unlocked: (c) => c.threat >= 15,
  },
  {
    id: "global-3",
    name: "Contrato de Longa-Metragem",
    desc: "Todo o efetivo produz 1,6x mais. Três filmes anunciados antes do primeiro roteiro existir.",
    kind: "global",
    cost: 3_000_000_000_000,
    mult: 1.6,
    emoji: "🎬",
    reqText: "Ameaça 19",
    unlocked: (c) => c.threat >= 19,
  },
  {
    id: "global-4",
    name: "Cooperação Internacional",
    desc: "Todo o efetivo produz 1,8x mais. O organograma agora exige um diagrama à parte.",
    kind: "global",
    cost: 500_000_000_000_000,
    mult: 1.8,
    emoji: "🪐",
    reqText: "Ameaça 23",
    unlocked: (c) => c.threat >= 23,
  },
  {
    id: "global-5",
    name: "Cúpula Anual de Segurança",
    desc: "Todo o efetivo produz 2x mais. Comparecimento obrigatório, resultados opcionais.",
    kind: "global",
    cost: 90_000_000_000_000_000,
    mult: 2,
    emoji: "💫",
    reqText: "Ameaça 27",
    unlocked: (c) => c.threat >= 27,
  },
];

/**
 * Per-hero re-flavoring of the two upgrades below — same cost/mult/level gate
 * for everyone, but a hero with a written-out arc gets copy (and, in
 * HeroBody.svelte, a visual stage) that actually matches their gag instead of
 * the generic "destaque em campo" template. Heroes not listed here just keep
 * the template; this fills in one at a time.
 */
interface HeroFlavor {
  aName: string;
  aDesc: string;
  bName: string;
  bDesc: string;
  /** Only unlock post-prestige — the capstone pair, same idea one arc further. */
  cName: string;
  cDesc: string;
  dName: string;
  dDesc: string;
}

const HERO_FLAVOR: Record<string, HeroFlavor> = {
  "rapaz-barata": {
    aName: "Rapaz-Barata: casaco de sobrevivente",
    aDesc: "Depois da segunda explosão, aprendeu a andar preparado. Produz o dobro.",
    bName: "Rapaz-Barata: carapaça irradiada",
    bDesc: "A explosão nuclear não matou — só deixou mais resistente. Produz 3x mais.",
    cName: "Rapaz-Barata: lenda da baixaria",
    cDesc: "Sobrevive a qualquer coisa e ainda reclama do catering. Produz 4x mais.",
    dName: "Rapaz-Barata: extinção cancelada",
    dDesc: "Vai sobreviver à própria extinção, por pura implicância. Produz 6x mais.",
  },
  torneco: {
    aName: "Torneco: martelo emprestado",
    aDesc: "Ainda não é digno, mas o RH deixou levar pra casa. Produz o dobro.",
    bName: "Torneco: trono provisório",
    bDesc: "Reconquistou o reino. A dívida, infelizmente, é vitalícia. Produz 3x mais.",
    cName: "Torneco: coroação oficial",
    cDesc: "Agora é digno de verdade. A dívida segue vitalícia mesmo assim. Produz 4x mais.",
    dName: "Torneco: dinastia quitada",
    dDesc: "Pagou a dívida inteira. Ninguém sabe explicar como. Produz 6x mais.",
  },
  "alho-poro": {
    aName: "Capitão Alho-Poró: fita remasterizada",
    aDesc: "Redescobriu a trilha sonora e ficou insuportável de animado. Produz o dobro.",
    bName: "Capitão Alho-Poró: curadoria definitiva",
    bDesc: "A tripulação parou de discordar — desistiu. Produz 3x mais.",
    cName: "Capitão Alho-Poró: turnê de despedida",
    cDesc: "Anuncia a aposentadoria pela quinta vez. A galáxia aplaude, educada. Produz 4x mais.",
    dName: "Capitão Alho-Poró: greatest hits",
    dDesc: "Voltou. Ninguém duvidava que voltaria. Produz 6x mais.",
  },
  "viuva-cinza": {
    aName: "Viúva Cinza: dossiê atualizado",
    aDesc: "Os dois currículos, o de espiã e o de RH, finalmente batem. Produz o dobro.",
    bName: "Viúva Cinza: contato duplo",
    bDesc: "Ninguém sabe pra quem ela realmente responde. Nem ela. Produz 3x mais.",
    cName: "Viúva Cinza: identidade tripla",
    cDesc: "Agora nem o RH sabe pra quem ela responde. Produz 4x mais.",
    dName: "Viúva Cinza: arquivo selado",
    dDesc: "O próprio dossiê dela virou confidencial. Produz 6x mais.",
  },
  "capitao-brasil": {
    aName: "Capitão Brasil: escudo restaurado",
    aDesc: "As referências continuam de 1943, mas o equipamento é novo. Produz o dobro.",
    bName: "Capitão Brasil: valores intactos",
    bDesc: "Ninguém teve coragem de atualizá-lo — e funciona. Produz 3x mais.",
    cName: "Capitão Brasil: estátua erguida",
    cDesc: "Ganhou monumento em vida. Achou desnecessário. Foi ignorado. Produz 4x mais.",
    dName: "Capitão Brasil: feriado nacional",
    dDesc: "O dia dele virou data comemorativa. O comércio adorou. Produz 6x mais.",
  },
  "ghomme-de-ferro": {
    aName: "Ghomme de Ferro: armadura patrocinada",
    aDesc: "Impecável por fora. Por dentro, ainda é ele mesmo. Produz o dobro.",
    bName: "Ghomme de Ferro: liga inteira",
    bDesc: "Banca todo mundo e faz questão que ninguém esqueça. Produz 3x mais.",
    cName: "Ghomme de Ferro: patente registrada",
    cDesc: "Registrou o próprio nome como marca e cobra royalties da liga. Produz 4x mais.",
    dName: "Ghomme de Ferro: legado bilionário",
    dDesc: "Virou estudo de caso em faculdade de administração. Produz 6x mais.",
  },
  ciumento: {
    aName: "Ciumento: cicatrização acelerada",
    aDesc: "O corpo esquece rápido. A cabeça, nunca. Produz o dobro.",
    bName: "Ciumento: rancor arquivado",
    bDesc: "Tem uma lista. A lista tem década. Produz 3x mais.",
    cName: "Ciumento: cura definitiva",
    cDesc: "Parou de guardar rancor. Trocou por uma planilha. Produz 4x mais.",
    dName: "Ciumento: paz assinada",
    dDesc: "Fez as pazes com todo mundo. Documentado, com testemunhas. Produz 6x mais.",
  },
  "a-massa": {
    aName: "A Massa: sétima sessão",
    aDesc: "O sexto terapeuta recomendou parar de trabalhar. Ele discordou educadamente. Produz o dobro.",
    bName: "A Massa: alta médica",
    bDesc: "Voltou no dia seguinte mesmo assim. Produz 3x mais.",
    cName: "A Massa: oitava sessão",
    cDesc: "O sétimo terapeuta se aposentou por causa dele. Produz 4x mais.",
    dName: "A Massa: caso encerrado",
    dDesc: "Recebeu alta oficial. Voltou pro trabalho na mesma hora. Produz 6x mais.",
  },
  "ima-neto": {
    aName: "Ímã-Neto: registro atualizado",
    aDesc: "O jurídico ainda tenta decidir se ele é réu ou testemunha. Produz o dobro.",
    bName: "Ímã-Neto: polaridade revista",
    bDesc: "Virou herói de novo. Dessa vez juram que é definitivo. Produz 3x mais.",
    cName: "Ímã-Neto: pena cumprida",
    cDesc: "O jurídico arquivou o processo. Por exaustão. Produz 4x mais.",
    dName: "Ímã-Neto: herói vitalício",
    dDesc: "Assinou contrato de longo prazo dessa vez. Notarizado. Produz 6x mais.",
  },
  "doutor-estranhissimo": {
    aName: "Doutor Estranhíssimo: futuro consultado",
    aDesc: "Viu esse resultado chegando de longe. Produz o dobro.",
    bName: "Doutor Estranhíssimo: prazo previsto",
    bDesc: "Em nenhum futuro a liga entrega no prazo. Nesse, quase. Produz 3x mais.",
    cName: "Doutor Estranhíssimo: futuro alcançado",
    cDesc: "O futuro que ele viu chegando finalmente chegou. No prazo, aliás. Produz 4x mais.",
    dName: "Doutor Estranhíssimo: multiverso quitado",
    dDesc: "Visitou todos os futuros possíveis. Escolheu ficar neste. Produz 6x mais.",
  },
  "pantera-parda": {
    aName: "Pantera Parda: tecnologia liberada",
    aDesc: "Compareceu à reunião e, de quebra, trouxe upgrade. Produz o dobro.",
    bName: "Pantera Parda: reinado consolidado",
    bDesc: "Governa uma nação inteira sem faltar a uma reunião sequer. Produz 3x mais.",
    cName: "Pantera Parda: legado consolidado",
    cDesc: "A nação inteira já funciona sem ele precisar aparecer. Produz 4x mais.",
    dName: "Pantera Parda: era de ouro",
    dDesc: "Os livros de história já começaram a escrever sobre o reinado. Produz 6x mais.",
  },
  "tio-thanao": {
    aName: "Tio Thanão: planilha equilibrada",
    aDesc: "Trocou metade do universo por metade dos recursos. Mais eficiente. Produz o dobro.",
    bName: "Tio Thanão: consultoria vitalícia",
    bDesc: "Contrato renovado automaticamente — igual antes, sem o extermínio. Produz 3x mais.",
    cName: "Tio Thanão: relatório trimestral",
    cDesc: "Apresenta os números do extermínio parcial ao conselho. Aprovado por unanimidade. Produz 4x mais.",
    dName: "Tio Thanão: sócio majoritário",
    dDesc: "Virou dono de metade da empresa. A outra metade, ele já cortou. Produz 6x mais.",
  },
};

// Two per hero, gated behind that hero's own level — rewards specializing.
// The first pair (a/b) retires once the hero prestiges: buy them before then,
// or they're gone for good (see prestigeHero() in state.ts). The second pair
// (c/d) only exists after that trade — the same escalation, one arc further.
const HERO_UPGRADES: UpgradeDef[] = HEROES.flatMap((h) => {
  const flavor = HERO_FLAVOR[h.id];
  return [
    {
      id: `hero-${h.id}-a`,
      name: flavor?.aName ?? `${h.name}: destaque em campo`,
      desc: flavor?.aDesc ?? `${h.name} produz o dobro.`,
      kind: "hero" as const,
      cost: h.recruitCost * 60,
      mult: 2,
      heroId: h.id,
      emoji: h.emoji,
      reqText: `${h.name} nível 10`,
      unlocked: (c: UpgradeContext) => (c.levels[h.id] ?? 0) >= 10 && !c.prestiged.includes(h.id),
    },
    {
      id: `hero-${h.id}-b`,
      name: flavor?.bName ?? `${h.name}: comando de célula`,
      desc: flavor?.bDesc ?? `${h.name} produz 3x mais.`,
      kind: "hero" as const,
      cost: h.recruitCost * 1_200,
      mult: 3,
      heroId: h.id,
      emoji: h.emoji,
      reqText: `${h.name} nível 30`,
      unlocked: (c: UpgradeContext) => (c.levels[h.id] ?? 0) >= 30 && !c.prestiged.includes(h.id),
    },
    {
      id: `hero-${h.id}-c`,
      name: flavor?.cName ?? `${h.name}: capítulo seguinte`,
      desc: flavor?.cDesc ?? `${h.name} produz 4x mais.`,
      kind: "hero" as const,
      cost: h.recruitCost * 24_000,
      mult: 4,
      heroId: h.id,
      emoji: h.emoji,
      reqText: `${h.name} prestigiado`,
      unlocked: (c: UpgradeContext) => c.prestiged.includes(h.id),
    },
    {
      id: `hero-${h.id}-d`,
      name: flavor?.dName ?? `${h.name}: consagração`,
      desc: flavor?.dDesc ?? `${h.name} produz 6x mais.`,
      kind: "hero" as const,
      cost: h.recruitCost * 480_000,
      mult: 6,
      heroId: h.id,
      emoji: h.emoji,
      reqText: `${h.name} prestigiado`,
      unlocked: (c: UpgradeContext) => c.prestiged.includes(h.id),
    },
  ];
});

export const UPGRADES: UpgradeDef[] = [...GLOBAL_UPGRADES, ...HERO_UPGRADES];

export const UPGRADES_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
