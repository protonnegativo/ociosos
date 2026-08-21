import Decimal from "break_infinity.js";

export interface ThreatDef {
  name: string;
  emoji: string;
  taunt: string;
}

// The agency's threat ledger, escalating from street crime to cosmic
// bureaucracy. Played straight — every one of them is a real problem, and the
// humor is in how mundane the paperwork stays as the stakes climb.
export const THREATS: ThreatDef[] = [
  { name: "Assaltante Aumentado", emoji: "🔫", taunt: "Comprei os poderes num site. Vieram sem manual." },
  { name: "Gangue Sincronizada", emoji: "🎭", taunt: "Somos quinze com o mesmo rosto. Boa sorte no relatório." },
  { name: "Mercenário Licenciado", emoji: "💼", taunt: "Nada pessoal. Está tudo previsto em contrato." },
  { name: "Culto do Fim do Mês", emoji: "🕯️", taunt: "O fim está próximo. A mensalidade também." },
  { name: "Milícia Corporativa", emoji: "🏢", taunt: "Temos mais armamento do que vocês têm autorização." },
  { name: "Experimento Vazado", emoji: "🧪", taunt: "Não fui projetado para isto. Estou improvisando." },
  { name: "Rede de Espionagem", emoji: "📡", taunt: "Já lemos todos os seus memorandos internos." },
  { name: "Agência Rival", emoji: "🕶️", taunt: "Fazemos o mesmo que vocês, com metade da burocracia." },
  { name: "Inteligência Hostil", emoji: "🧠", taunt: "Calculei todas as suas respostas. Escolha uma." },
  { name: "Frota de Anexação", emoji: "🛸", taunt: "Este planeta consta como disponível em nossos registros." },
  { name: "Entidade Sem Forma", emoji: "🌑", taunt: "Vocês não têm vocabulário para o que eu sou." },
  { name: "O Conselho Cósmico", emoji: "⚖️", taunt: "Seu mundo está em análise. O parecer é desfavorável." },
];

export function threatFor(level: number): ThreatDef {
  const idx = (level - 1) % THREATS.length;
  const cycle = Math.floor((level - 1) / THREATS.length);
  const base = THREATS[idx];
  // Past the first sweep they come back logged as repeat offenders.
  if (cycle === 0) return base;
  return { ...base, name: `${base.name} — reincidência ${cycle + 1}` };
}

/** Combined output (Verba/s) the roster needs to neutralize this threat. */
export function threatThreshold(level: number): Decimal {
  return new Decimal(40).times(Decimal.pow(1.62, level - 1));
}

/** Verba awarded for closing a threat level. */
export function threatReward(level: number): Decimal {
  return threatThreshold(level).times(25);
}

/** Every neutralized threat permanently raises the agency's output. */
export function threatMultiplier(level: number): number {
  return 1 + 0.04 * (level - 1);
}
