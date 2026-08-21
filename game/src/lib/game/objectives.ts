import Decimal from "break_infinity.js";
import type { GameState } from "./state";
import { threatThreshold } from "./threats";

export interface Objective {
  text: string;
  /** Where to act. Lets the bar send the player straight to the right tab. */
  tab: string;
  current: number;
  target: number;
}

/**
 * A short-term goal that is always on screen. "Não sei o que fazer" comes from
 * having no visible next step — a hint that fades is not enough, so this is a
 * permanent bar rather than a toast.
 */
export function currentObjective(
  s: GameState,
  production: Decimal,
  recruited: number,
  investigating: number,
): Objective {
  if (recruited === 0) {
    return { text: "Aliste seu primeiro herói — o alistamento é gratuito", tab: "efetivo", current: 0, target: 1 };
  }
  if (recruited < 2) {
    return { text: "Aliste um segundo herói para abrir a Investigação", tab: "efetivo", current: 1, target: 2 };
  }
  if (investigating === 0 && s.intel < 5) {
    return {
      text: "Designe um herói para a Investigação — operações precisam de Intel",
      tab: "efetivo",
      current: 0,
      target: 1,
    };
  }
  if (s.opsCompleted === 0 && s.activeOps.length === 0) {
    if (s.intel < 5) {
      return { text: "Junte Intel para a primeira operação de campo", tab: "efetivo", current: Math.floor(s.intel), target: 5 };
    }
    return { text: "Monte uma equipe e envie a campo", tab: "operacoes", current: 0, target: 1 };
  }

  const threshold = threatThreshold(s.threat);
  const pct = production.div(threshold).toNumber();
  return {
    text: `Neutralizar a Ameaça nível ${s.threat}`,
    tab: "efetivo",
    current: Math.min(100, Math.round((Number.isFinite(pct) ? pct : 0) * 100)),
    target: 100,
  };
}
