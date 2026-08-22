import { readable } from "svelte/store";

/**
 * A single shared tick for on-screen countdowns — buff timers, operation
 * progress bars, cooldowns. Before this, each component that needed one ran
 * its own setInterval just to refresh a local "now"; this replaces all of
 * them with one shared source.
 */
export const now = readable(Date.now(), (set) => {
  const id = setInterval(() => set(Date.now()), 250);
  return () => clearInterval(id);
});
