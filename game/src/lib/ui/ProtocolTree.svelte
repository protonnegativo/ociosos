<script lang="ts">
  import { game, protocolLevel, protocolUnlocked, buyProtocol } from "../game/state";
  import { PROTOCOLS, protocolCost, protocolDepth, PROTOCOL_MAX_DEPTH } from "../game/protocols";
  import { formatNumber } from "../game/format";

  function cardFor(id: string) {
    const def = PROTOCOLS.find((p) => p.id === id)!;
    const level = protocolLevel($game, id);
    const revealed = level > 0;
    const maxed = level >= def.maxLevel;
    const cost = protocolCost(def, level);
    const affordable = !maxed && $game.dossies.gte(cost);
    return { def, level, revealed, maxed, cost, affordable };
  }

  // Only Protocolos whose requirement is already met are even rendered — the
  // rest stay invisible, so nobody can tell how many are left to find.
  let rows = $derived(
    Array.from({ length: PROTOCOL_MAX_DEPTH + 1 }, (_, depth) =>
      PROTOCOLS.filter((p) => protocolDepth(p.id) === depth && protocolUnlocked($game, p.id)).map((p) =>
        cardFor(p.id),
      ),
    ).filter((row) => row.length > 0),
  );
</script>

<div class="tree">
  {#each rows as row, i (i)}
    {#if i > 0}<div class="connector"></div>{/if}
    <div class="row">
      {#each row as c (c.def.id)}
        <div class="node" class:revealed={c.revealed} class:maxed={c.maxed} class:affordable={c.affordable}>
          {#if c.revealed}
            <div class="node-emoji">{c.def.emoji}</div>
            <div class="node-name">{c.def.name}</div>
            <div class="node-desc">{c.def.desc(c.level)}</div>
            <button class="node-buy" disabled={!c.affordable} onclick={() => buyProtocol(c.def.id)}>
              {#if c.maxed}
                <span class="label">Completo</span>
              {:else}
                <span class="mono">🗂️ {formatNumber(c.cost, 0)}</span>
              {/if}
            </button>
            <span class="node-level mono">{c.maxed ? "MÁX" : `NV ${c.level}`}</span>
          {:else}
            <div class="node-emoji mystery">🔒</div>
            <div class="node-name">Protocolo classificado</div>
            <div class="node-desc">O efeito só é revelado ao ativar.</div>
            <button class="node-buy" disabled={!c.affordable} onclick={() => buyProtocol(c.def.id)}>
              <span class="mono">🗂️ {formatNumber(c.cost, 0)}</span>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .tree {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .connector {
    width: 1px;
    height: 16px;
    background: var(--rule);
  }
  .row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .node {
    position: relative;
    width: 168px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.3rem;
    background: var(--panel);
    border: 1.5px dashed var(--rule);
    border-radius: 10px;
    padding: 0.7rem 0.6rem 0.6rem;
    opacity: 0.72;
  }
  .node.revealed {
    border-style: solid;
    opacity: 1;
  }
  .node.affordable {
    border-color: var(--fragment-cyan);
  }
  .node.maxed {
    opacity: 0.75;
  }

  .node-emoji {
    font-size: 1.5rem;
    width: 2.3rem;
    height: 2.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel-raised);
    border-radius: 8px;
  }
  .node-emoji.mystery {
    filter: grayscale(1);
    opacity: 0.6;
  }
  .node-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.78rem;
    line-height: 1.15;
  }
  .node:not(.revealed) .node-name {
    color: var(--text-faint);
  }
  .node-desc {
    font-size: 0.68rem;
    color: var(--text-soft);
    min-height: 2.4em;
  }
  .node:not(.revealed) .node-desc {
    font-style: italic;
    color: var(--text-faint);
  }
  .node-buy {
    width: 100%;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.35rem 0.5rem;
    color: var(--paper);
    font-size: 0.74rem;
  }
  .node-buy:not(:disabled) {
    background: color-mix(in srgb, var(--fragment-cyan) 20%, var(--panel-raised));
    border-color: var(--fragment-cyan);
    color: var(--fragment-cyan);
  }
  .node-buy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .node-buy .label {
    color: var(--text-faint);
  }
  .node-level {
    position: absolute;
    top: -8px;
    right: -6px;
    background: var(--fragment-cyan);
    color: #06201e;
    font-size: 0.58rem;
    font-weight: 700;
    border-radius: 999px;
    padding: 0.05rem 0.4rem;
  }
</style>
