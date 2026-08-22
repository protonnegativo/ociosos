<script lang="ts">
  import type { HeroDef } from "../game/heroes";
  import { FACTION_COLOR } from "../game/heroes";

  let {
    def,
    level = 0,
    size = 56,
    showLevel = false,
  }: { def: HeroDef; level?: number; size?: number; showLevel?: boolean } = $props();

  const ROLE_SHAPE: Record<string, string> = {
    Dano: "star",
    Tanque: "hex",
    Suporte: "cross",
    Utilidade: "diamond",
    Controle: "rings",
  };

  let shape = $derived(ROLE_SHAPE[def.role] ?? "diamond");
  let dim = $derived(level <= 0);
</script>

<div
  class="portrait rarity-{def.rarity}"
  class:dim
  style="--size: {size}px; --faction: {FACTION_COLOR[def.faction]}"
  title="{def.name} · {def.role} · {def.faction}"
>
  <div class="ring"></div>
  {#if shape === "rings"}
    <div class="aura orbit"></div>
  {:else}
    <div class="aura shape-{shape}"></div>
  {/if}
  <span class="emoji" style="font-size: {size * 0.5}px">{def.emoji}</span>
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
    background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--faction) 38%, var(--panel-raised)), var(--panel-raised) 75%);
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

  .aura {
    position: absolute;
    width: 74%;
    height: 74%;
    background: color-mix(in srgb, var(--faction) 55%, transparent);
    opacity: 0.4;
  }
  .aura.shape-star {
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
  }
  .aura.shape-hex {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  .aura.shape-cross {
    clip-path: polygon(
      35% 0%,
      65% 0%,
      65% 35%,
      100% 35%,
      100% 65%,
      65% 65%,
      65% 100%,
      35% 100%,
      35% 65%,
      0% 65%,
      0% 35%,
      35% 35%
    );
  }
  .aura.shape-diamond {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .aura.orbit {
    width: 92%;
    height: 92%;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      color-mix(in srgb, var(--faction) 65%, transparent) 90deg,
      transparent 180deg,
      color-mix(in srgb, var(--faction) 65%, transparent) 270deg,
      transparent 360deg
    );
    animation: orbit-spin 6s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .aura.orbit {
      animation: none;
    }
  }
  @keyframes orbit-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .emoji {
    position: relative;
    z-index: 1;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  }

  .level {
    position: absolute;
    bottom: -2px;
    right: -2px;
    z-index: 2;
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
