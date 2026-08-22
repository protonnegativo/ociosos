<script lang="ts">
  import { BODIES } from "../game/bodies";
  import { FACES } from "../game/faces";
  import HeroFace from "./HeroFace.svelte";

  let {
    heroId,
    tier = 0,
    width = 140,
    prestiged = false,
  }: { heroId: string; tier?: number; width?: number; prestiged?: boolean } = $props();

  // Prestige always shows the best costume/pose the hero has art for — the
  // upgrade is the point, not a costume the player happens to own.
  let stage = $derived(BODIES[heroId]?.[prestiged ? 2 : Math.min(2, Math.max(0, tier))]);
  let skin = $derived(FACES[heroId]?.skin ?? "#c9a37a");
  let scale = $derived(width / 140);
</script>

{#if stage}
  <div class="body" style="width: {width}px; height: {width * 1.6}px; --scale: {scale}">
    {#if prestiged}
      <div class="rays"></div>
    {/if}
    {#if stage.glow || prestiged}
      <div class="glow" class:legendary={prestiged} style="--glow: {prestiged ? '#ffd76a' : stage.glow}"></div>
    {/if}

    <svg class="torso" viewBox="0 0 120 170" width={width} height={width * (170 / 120)}>
      {#if stage.cape}
        <path d="M32,16 Q10,70 22,150 Q40,110 44,60 Z" fill="#3a1418" opacity="0.9" />
        <path d="M88,16 Q110,70 98,150 Q80,110 76,60 Z" fill="#3a1418" opacity="0.9" />
      {/if}

      <!-- legs -->
      {#if stage.pose === "action"}
        <line x1="52" y1="98" x2="34" y2="150" stroke={stage.shirtAccent} stroke-width="15" stroke-linecap="round" />
        <line x1="68" y1="98" x2="86" y2="145" stroke={stage.shirtAccent} stroke-width="15" stroke-linecap="round" />
      {:else}
        <line x1="50" y1="98" x2="46" y2="155" stroke={stage.shirtAccent} stroke-width="15" stroke-linecap="round" />
        <line x1="70" y1="98" x2="74" y2="155" stroke={stage.shirtAccent} stroke-width="15" stroke-linecap="round" />
      {/if}
      <ellipse cx="42" cy="158" rx="9" ry="5" fill="#241d17" />
      <ellipse cx="78" cy="158" rx="9" ry="5" fill="#241d17" />

      <!-- arms (behind torso on the far side) -->
      {#if stage.pose === "stand"}
        <line x1="32" y1="20" x2="22" y2="80" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" />
        <line x1="88" y1="20" x2="98" y2="80" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" />
        <circle cx="22" cy="83" r="6" fill={skin} />
        <circle cx="98" cy="83" r="6" fill={skin} />
      {:else if stage.pose === "confident"}
        <path d="M32,20 L16,50 L36,68" fill="none" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="36" cy="68" r="6" fill={skin} />
        <path d="M88,20 L104,48 L96,74" fill="none" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="96" cy="74" r="6" fill={skin} />
      {:else}
        <path d="M32,20 L8,4 L-2,-10" fill="none" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="-2" cy="-10" r="6" fill={skin} />
        <path d="M88,20 L106,46 L98,72" fill="none" stroke={stage.shirt} stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="98" cy="72" r="6" fill={skin} />
      {/if}

      {#if stage.prop === "pipe"}
        <line
          x1="90" y1="55" x2="112" y2="30"
          stroke="#7a7d82" stroke-width="6" stroke-linecap="round"
          transform={stage.pose === "action" ? "rotate(-15 100 45)" : ""}
        />
      {:else if stage.prop === "hammer"}
        <g transform={stage.pose === "action" ? "rotate(-20 100 45)" : ""}>
          <line x1="90" y1="60" x2="108" y2="26" stroke="#6b5a45" stroke-width="6" stroke-linecap="round" />
          <rect x="98" y="10" width="20" height="14" rx="2" fill="#7a7d82" transform="rotate(28 108 17)" />
        </g>
      {:else if stage.prop === "shield"}
        <ellipse cx="14" cy="60" rx="16" ry="20" fill="#1f6b3a" stroke="#d9a441" stroke-width="3" />
        <circle cx="14" cy="60" r="6" fill="#d9a441" />
      {/if}

      <!-- torso -->
      <path d="M30,14 Q60,7 90,14 L84,96 Q60,104 36,96 Z" fill={stage.shirt} />
      <path d="M50,16 L60,30 L70,16 L66,14 L60,20 L54,14 Z" fill={stage.shirtAccent} />

      <!-- neck -->
      <rect x="53" y="2" width="14" height="16" rx="4" fill={skin} />
    </svg>

    <div class="head" style="top: {-6 * scale}px">
      <HeroFace {heroId} size={54 * scale} />
    </div>

    {#if prestiged}
      <div class="crown" style="top: {-22 * scale}px; font-size: {1.3 * scale}rem">👑</div>
    {/if}
  </div>
{/if}

<style>
  .body {
    position: relative;
    display: flex;
    justify-content: center;
  }
  .torso {
    position: absolute;
    top: calc(30px * var(--scale));
    left: 0;
  }
  .head {
    position: relative;
    z-index: 1;
  }
  .glow {
    position: absolute;
    top: 10%;
    left: 50%;
    width: 90%;
    aspect-ratio: 1;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent) 0%, transparent 70%);
    animation: glow-pulse 2.4s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .glow {
      animation: none;
    }
  }
  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
  .glow.legendary {
    width: 105%;
  }

  .rays {
    position: absolute;
    top: 4%;
    left: 50%;
    width: 135%;
    aspect-ratio: 1;
    transform: translateX(-50%);
    border-radius: 50%;
    background: repeating-conic-gradient(
      from 0deg,
      color-mix(in srgb, #ffd76a 20%, transparent) 0deg 8deg,
      transparent 8deg 20deg
    );
    animation: rays-spin 14s linear infinite;
    opacity: 0.65;
  }
  @keyframes rays-spin {
    to {
      transform: translateX(-50%) rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .rays {
      animation: none;
    }
  }

  .crown {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    line-height: 1;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
  }
</style>
