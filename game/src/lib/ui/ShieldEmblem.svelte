<script lang="ts">
  import { game, protocolLevel, protocolTierUnlocked } from "../game/state";
  import { protocolsInTier, type ProtocolDef } from "../game/protocols";

  const TIER_ACCENT: Record<number, string> = {
    1: "var(--power-gold)",
    2: "var(--sky-blue)",
    3: "var(--fragment-cyan)",
  };

  // Filled in unlock order — tier 1 first, so the shield reads top-to-bottom
  // as "how far the agency's institutional memory has come".
  let rows = $derived([
    protocolsInTier(1).map((p) => piece(p)),
    protocolsInTier(2).map((p) => piece(p)),
    protocolsInTier(3).map((p) => piece(p)),
  ]);

  function piece(def: ProtocolDef) {
    const level = protocolLevel($game, def.id);
    const tierOpen = protocolTierUnlocked($game, def.tier);
    return { def, level, tierOpen, active: level > 0 };
  }

  let totalActive = $derived(rows.flat().filter((p) => p.active).length);
  let totalPieces = $derived(rows.flat().length);
</script>

<div class="shield-wrap">
  <div class="shield-bg"></div>
  <div class="shield-body">
    {#each rows as row, i (i)}
      <div class="shield-row">
        {#each row as p (p.def.id)}
          <div
            class="piece"
            class:active={p.active}
            class:hidden-piece={!p.tierOpen}
            style="--accent: {TIER_ACCENT[p.def.tier]}"
            title={p.tierOpen ? `${p.def.name} — nível ${p.level}` : "Camada ainda não revelada"}
          >
            {#if p.tierOpen}
              <span class="piece-emoji">{p.def.emoji}</span>
              {#if p.level > 0}
                <span class="piece-level mono">{p.level}</span>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div class="shield-caption">
    <span class="shield-name label">E.S.C.U.D.O.</span>
    <span class="shield-count mono">{totalActive}/{totalPieces} peças</span>
  </div>
</div>

<style>
  .shield-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 1.4rem 1rem 1rem;
  }

  .shield-bg {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(340px, 90%);
    height: 220px;
    clip-path: polygon(0% 0%, 100% 0%, 100% 58%, 50% 100%, 0% 58%);
    background: linear-gradient(160deg, var(--panel-raised), var(--panel) 70%);
    border: 1px solid var(--rule);
  }

  .shield-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.55rem;
    padding-top: 0.3rem;
  }

  .shield-row {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .piece {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1.5px dashed color-mix(in srgb, var(--accent) 45%, var(--rule));
    background: color-mix(in srgb, var(--accent) 6%, transparent);
    font-size: 1.15rem;
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      transform 0.2s ease;
  }
  .piece.active {
    border-style: solid;
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 26%, var(--panel));
    box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 35%, transparent);
  }
  .piece.hidden-piece {
    border-style: dotted;
    border-color: color-mix(in srgb, var(--rule) 70%, transparent);
    background: color-mix(in srgb, var(--ink) 30%, transparent);
    opacity: 0.5;
  }

  .piece-level {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: var(--accent);
    color: var(--ink);
    font-size: 0.58rem;
    font-weight: 700;
    border-radius: 999px;
    padding: 0 0.3rem;
    line-height: 1.3;
  }

  .shield-caption {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    margin-top: 0.2rem;
  }
  .shield-name {
    font-size: 0.72rem;
    color: var(--power-gold);
    letter-spacing: 0.16em;
  }
  .shield-count {
    font-size: 0.7rem;
    color: var(--text-faint);
  }
</style>
