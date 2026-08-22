<script lang="ts">
  import type { HeroDef } from "../game/heroes";
  import { FACTION_COLOR } from "../game/heroes";
  import HeroFace from "./HeroFace.svelte";

  let {
    def,
    level = 0,
    size = 56,
    showLevel = false,
  }: { def: HeroDef; level?: number; size?: number; showLevel?: boolean } = $props();

  let dim = $derived(level <= 0);
</script>

<div
  class="portrait rarity-{def.rarity}"
  class:dim
  style="--size: {size}px; --faction: {FACTION_COLOR[def.faction]}"
  title="{def.name} · {def.role} · {def.faction}"
>
  <div class="ring"></div>
  <div class="face"><HeroFace heroId={def.id} size={size * 0.86} /></div>
  {#if showLevel && level > 0}<span class="level mono">{level}</span>{/if}
</div>

<style>
  .portrait {
    position: relative;
    width: var(--size);
    height: var(--size);
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--faction) 30%, var(--panel-raised)), var(--panel-raised) 75%);
    overflow: hidden;
  }
  .portrait.dim {
    filter: grayscale(0.75);
    opacity: 0.55;
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--faction) 55%, var(--rule));
    pointer-events: none;
    z-index: 2;
  }
  .rarity-4 .ring {
    border-color: color-mix(in srgb, var(--power-gold) 55%, var(--faction));
    box-shadow: 0 0 6px color-mix(in srgb, var(--power-gold) 35%, transparent);
  }
  .rarity-5 .ring {
    border-width: 2.5px;
    border-color: var(--power-gold);
    box-shadow: 0 0 9px color-mix(in srgb, var(--power-gold) 55%, transparent);
    animation: rarity-glow 2.6s ease-in-out infinite;
  }
  @keyframes rarity-glow {
    0%,
    100% {
      box-shadow: 0 0 9px color-mix(in srgb, var(--power-gold) 55%, transparent);
    }
    50% {
      box-shadow: 0 0 15px color-mix(in srgb, var(--power-gold) 80%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .rarity-5 .ring {
      animation: none;
    }
  }

  .face {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .level {
    position: absolute;
    bottom: -2px;
    right: -2px;
    z-index: 3;
    background: var(--power-gold);
    color: var(--ink);
    font-size: 0.6rem;
    font-weight: 700;
    border-radius: 999px;
    padding: 0.02rem 0.32rem;
    line-height: 1.35;
    border: 1px solid var(--panel);
  }
</style>
