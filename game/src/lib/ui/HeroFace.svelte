<script lang="ts">
  import { FACES } from "../game/faces";

  let { heroId, size = 56 }: { heroId: string; size?: number } = $props();

  let f = $derived(FACES[heroId]);

  // Eye geometry: openness drives the white ellipse's height. Very closed
  // eyes read better as a drawn line than a squashed ellipse.
  function eyeRy(open: number): number {
    return 2.5 + open * 6.5;
  }
  let eyeRyValue = $derived(eyeRy(f.eyeOpen));
  let pupilR = $derived(2 + f.eyeOpen * 1.6);

  // Mouth: a quadratic curve whose control point dips below the baseline for
  // a smile (corners read as raised) and rises above it for a frown.
  let mouthHalf = $derived(15 * f.mouthWidth);
  let mouthCtrlY = $derived(68 + f.smile * 11);
</script>

{#if f}
  <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="rosto">
    <g transform="translate(50 52) scale({f.headScaleX} {f.headScaleY}) translate(-50 -52)">
      <!-- head -->
      <path
        d="M50,20 C68,20 78,35 76,52 C74,68 64,84 50,88 C36,84 26,68 24,52 C22,35 32,20 50,20 Z"
        fill={f.skin}
      />

      {#if f.extra === "beard"}
        <path d="M30,60 Q50,88 70,60 Q68,76 50,80 Q32,76 30,60 Z" fill={f.extraColor} />
      {:else if f.extra === "goatee"}
        <path d="M40,64 Q50,82 60,64 Q56,74 50,76 Q44,74 40,64 Z" fill={f.extraColor} />
      {/if}

      <!-- brows -->
      <line
        x1="30" y1="42" x2="44" y2="42"
        stroke="#2a1c12" stroke-width="2.4" stroke-linecap="round"
        transform="rotate({f.browAngle} 37 42)"
      />
      <line
        x1="56" y1="42" x2="70" y2="42"
        stroke="#2a1c12" stroke-width="2.4" stroke-linecap="round"
        transform="rotate({-f.browAngle} 63 42)"
      />

      <!-- eyes -->
      {#if f.eyeOpen < 0.15}
        <path d="M31,50 Q37,54 43,50" fill="none" stroke="#2a1c12" stroke-width="2.2" stroke-linecap="round" />
        <path d="M57,50 Q63,54 69,50" fill="none" stroke="#2a1c12" stroke-width="2.2" stroke-linecap="round" />
      {:else}
        <ellipse cx="37" cy="50" rx="7.5" ry={eyeRyValue} fill="#fff" />
        <circle cx="37" cy="50" r={pupilR} fill="#20140c" />
        <ellipse cx="63" cy="50" rx="7.5" ry={eyeRyValue} fill="#fff" />
        <circle cx="63" cy="50" r={pupilR} fill="#20140c" />
      {/if}

      <!-- mouth -->
      <path
        d="M{50 - mouthHalf},68 Q50,{mouthCtrlY} {50 + mouthHalf},68"
        fill="none"
        stroke="#5a2f22"
        stroke-width="2.6"
        stroke-linecap="round"
      />

      <!-- accessory -->
      {#if f.accessory === "antennae"}
        <line x1="42" y1="24" x2="35" y2="8" stroke={f.accessoryColor} stroke-width="2.4" stroke-linecap="round" />
        <circle cx="35" cy="8" r="3" fill={f.accessoryColor} />
        <line x1="58" y1="24" x2="65" y2="8" stroke={f.accessoryColor} stroke-width="2.4" stroke-linecap="round" />
        <circle cx="65" cy="8" r="3" fill={f.accessoryColor} />
      {:else if f.accessory === "headphones"}
        <path d="M22,44 Q50,10 78,44" fill="none" stroke={f.accessoryColor} stroke-width="4.5" stroke-linecap="round" />
        <rect x="14" y="40" width="12" height="18" rx="6" fill={f.accessoryColor} />
        <rect x="74" y="40" width="12" height="18" rx="6" fill={f.accessoryColor} />
      {:else if f.accessory === "sunglasses"}
        <rect x="26" y="44" width="21" height="12" rx="4" fill={f.accessoryColor} />
        <rect x="53" y="44" width="21" height="12" rx="4" fill={f.accessoryColor} />
        <rect x="47" y="48" width="6" height="3" fill={f.accessoryColor} />
      {:else if f.accessory === "wingHelmet"}
        <path d="M22,42 Q9,37 7,50 Q18,48 27,45 Z" fill={f.accessoryColor} />
        <path d="M78,42 Q91,37 93,50 Q82,48 73,45 Z" fill={f.accessoryColor} />
        <rect x="23" y="29" width="54" height="9" rx="4.5" fill={f.accessoryColor} />
      {:else if f.accessory === "visor"}
        <rect x="25" y="45" width="50" height="9" rx="4.5" fill={f.accessoryColor} opacity="0.92" />
      {:else if f.accessory === "catEars"}
        <path d="M28,26 L19,7 L39,20 Z" fill={f.accessoryColor} />
        <path d="M72,26 L81,7 L61,20 Z" fill={f.accessoryColor} />
      {:else if f.accessory === "magnet"}
        <path d="M40,22 L40,7 Q50,1 60,7 L60,22" fill="none" stroke={f.accessoryColor} stroke-width="5.5" stroke-linecap="round" />
        <rect x="35.5" y="17" width="9" height="7" fill="#c94a3f" />
        <rect x="55.5" y="17" width="9" height="7" fill="#3f6fc9" />
      {:else if f.accessory === "spiral"}
        <path
          d="M50,30 Q57,30 57,37 Q57,43 50,43 Q45,43 45,38 Q45,35 48,35"
          fill="none"
          stroke={f.accessoryColor}
          stroke-width="2.2"
          stroke-linecap="round"
        />
      {:else if f.accessory === "cowl"}
        <path d="M27,24 L15,3 L37,18 Z" fill={f.accessoryColor} />
        <path d="M73,24 L85,3 L63,18 Z" fill={f.accessoryColor} />
        <path d="M22,37 Q50,25 78,37 L78,44 Q50,34 22,44 Z" fill={f.accessoryColor} />
      {/if}
    </g>
  </svg>
{/if}
