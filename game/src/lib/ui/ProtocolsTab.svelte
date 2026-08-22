<script lang="ts">
  import {
    game,
    buyProtocol,
    doRestructure,
    canRestructure,
    pendingDossies,
    currentDossieCap,
    dossieProgress,
    atDossieCap,
    protocolLevel,
    setAutoTrain,
    setAutoSpendFraction,
  } from "../game/state";
  import { PROTOCOLS, protocolCost } from "../game/protocols";
  import { formatNumber } from "../game/format";

  let confirming = $state(false);
  let pending = $derived(pendingDossies($game));
  let ready = $derived(canRestructure($game));
  let cap = $derived(currentDossieCap($game));
  let capped = $derived(atDossieCap($game));
  let progress = $derived(dossieProgress($game) * 100);
  let autoUnlocked = $derived(protocolLevel($game, "autonomo") > 0);
</script>

<div class="wrap">
  <section class="restructure-box" class:ready>
    <div class="restructure-head">
      <span class="label">Reestruturar a agência</span>
      <span class="dossie-count mono">🗂️ {formatNumber($game.dossies, 0)} dossiês</span>
    </div>
    <p class="restructure-copy">
      Reestruturar dissolve a administração atual: zera a Verba, dispensa o efetivo, cancela as melhorias e
      devolve a agência ao nível de ameaça 1. Em troca, tudo que você movimentou vira Dossiês — a memória
      institucional que os Protocolos abaixo transformam em vantagem permanente.
    </p>
    <div class="restructure-progress">
      <div class="rp-bar">
        <div class="rp-fill" style="width: {progress}%"></div>
      </div>
      <span class="rp-note mono">
        {#if capped}Arquivo cheio — o excedente desta administração se perde{:else}Rumo ao próximo Dossiê{/if}
      </span>
    </div>
    <div class="restructure-action">
      <div class="gain">
        <span class="gain-num mono">+{formatNumber(pending, 0)}<span class="gain-cap">/{cap.toLocaleString("pt-BR")}</span></span>
        <span class="gain-label label">dossiês ao reestruturar</span>
      </div>
      {#if confirming}
        <div class="confirm-row">
          <button class="btn-ghost" onclick={() => (confirming = false)}>Cancelar</button>
          <button
            class="restructure-btn"
            onclick={() => {
              doRestructure();
              confirming = false;
            }}>Confirmar reestruturação</button
          >
        </div>
      {:else}
        <button class="restructure-btn" disabled={!ready} onclick={() => (confirming = true)}>
          Reestruturar agência
        </button>
      {/if}
    </div>
  </section>

  {#if autoUnlocked}
    <section class="auto-box">
      <div class="auto-head">
        <span class="label">Comando autônomo</span>
        <label class="switch">
          <input type="checkbox" checked={$game.autoTrain} onchange={(e) => setAutoTrain(e.currentTarget.checked)} />
          <span>{$game.autoTrain ? "Ligado" : "Desligado"}</span>
        </label>
      </div>
      <p class="auto-copy">
        O efetivo treina sozinho, sempre escolhendo o herói com melhor retorno por Verba gasta.
      </p>
      <div class="reserve">
        <span class="reserve-label label">Pode usar até {Math.round($game.autoSpendFraction * 100)}% da Verba por compra</span>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={$game.autoSpendFraction * 100}
          oninput={(e) => setAutoSpendFraction(Number(e.currentTarget.value) / 100)}
        />
        <span class="reserve-hint">Manter reserva ajuda a neutralizar a próxima ameaça.</span>
      </div>
    </section>
  {/if}

  <section>
    <h3 class="label section-title">Protocolos permanentes</h3>
    <div class="grid">
      {#each PROTOCOLS as r (r.id)}
        {@const level = $game.protocols[r.id] ?? 0}
        {@const maxed = level >= r.maxLevel}
        {@const cost = protocolCost(r, level)}
        {@const affordable = !maxed && $game.dossies.gte(cost)}
        <div class="proto-card" class:affordable class:maxed>
          <div class="proto-emoji">{r.emoji}</div>
          <div class="proto-body">
            <div class="proto-top">
              <span class="proto-name">{r.name}</span>
              <span class="chip chip-cyan">
                {maxed ? "MÁX" : `NV ${level}`}
              </span>
            </div>
            <div class="proto-desc">{r.desc(level)}</div>
          </div>
          <button class="proto-buy" disabled={!affordable} onclick={() => buyProtocol(r.id)}>
            {#if maxed}
              <span class="label">Completo</span>
            {:else}
              <span class="mono cost">🗂️ {formatNumber(cost, 0)}</span>
            {/if}
          </button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }
  .section-title {
    font-size: 0.75rem;
    color: var(--text-faint);
    margin: 0 0 0.6rem;
  }

  .restructure-box {
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 1rem 1.1rem;
  }
  .restructure-box.ready {
    border-color: var(--fragment-cyan);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--fragment-cyan) 40%, transparent);
  }
  .restructure-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  .restructure-head .label {
    font-size: 0.75rem;
    color: var(--fragment-cyan);
  }
  .dossie-count {
    font-size: 0.82rem;
    color: var(--fragment-cyan);
  }
  .restructure-copy {
    font-size: 0.82rem;
    color: var(--text-soft);
    margin: 0 0 0.9rem;
    max-width: 62ch;
  }
  .restructure-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .gain {
    display: flex;
    flex-direction: column;
  }
  .gain-num {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--fragment-cyan);
    line-height: 1;
  }
  .gain-label {
    font-size: 0.62rem;
    color: var(--text-faint);
    margin-top: 0.15rem;
  }
  .gain-cap {
    font-size: 0.95rem;
    opacity: 0.55;
  }
  .restructure-progress {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.9rem;
  }
  .rp-bar {
    height: 8px;
    border-radius: 999px;
    background: var(--ink);
    border: 1px solid color-mix(in srgb, var(--fragment-cyan) 25%, var(--rule));
    overflow: hidden;
  }
  .rp-fill {
    height: 100%;
    background: var(--fragment-cyan);
    transition: width 0.2s ease-out;
  }
  .rp-note {
    font-size: 0.66rem;
    color: var(--text-faint);
  }
  .confirm-row {
    display: flex;
    gap: 0.5rem;
  }
  .restructure-btn {
    background: var(--fragment-cyan);
    color: #06201e;
    border: none;
    border-radius: 8px;
    padding: 0.55rem 1.1rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.82rem;
  }
  .restructure-btn:disabled {
    background: var(--panel-raised);
    color: var(--text-faint);
    cursor: not-allowed;
  }
  .restructure-btn:not(:disabled):hover {
    filter: brightness(1.1);
  }

  .auto-box {
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
  }
  .auto-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
  }
  .auto-head .label {
    font-size: 0.75rem;
    color: var(--gain-green);
  }
  .switch {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-soft);
    cursor: pointer;
  }
  .auto-copy {
    font-size: 0.78rem;
    color: var(--text-soft);
    margin: 0.4rem 0 0.7rem;
  }
  .reserve {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .reserve-label {
    font-size: 0.68rem;
    color: var(--text-faint);
  }
  .reserve input[type="range"] {
    width: 100%;
    accent-color: var(--gain-green);
  }
  .reserve-hint {
    font-size: 0.66rem;
    color: var(--text-faint);
    font-style: italic;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 0.6rem;
  }
  .proto-card {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
  }
  .proto-card.affordable {
    border-color: var(--fragment-cyan);
  }
  .proto-card.maxed {
    opacity: 0.7;
  }
  .proto-emoji {
    flex-shrink: 0;
    font-size: 1.4rem;
    width: 2.2rem;
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel-raised);
    border-radius: 8px;
  }
  .proto-body {
    flex: 1;
    min-width: 0;
  }
  .proto-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }
  .proto-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
  }
  .proto-desc {
    font-size: 0.72rem;
    color: var(--text-soft);
    margin-top: 0.15rem;
  }
  .proto-buy {
    flex-shrink: 0;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    min-width: 84px;
    color: var(--paper);
  }
  .proto-buy:not(:disabled) {
    background: color-mix(in srgb, var(--fragment-cyan) 20%, var(--panel-raised));
    border-color: var(--fragment-cyan);
  }
  .proto-buy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .proto-buy .cost {
    font-size: 0.76rem;
    color: var(--fragment-cyan);
  }
  .proto-buy:disabled .cost {
    color: var(--text-faint);
  }
  .proto-buy .label {
    font-size: 0.68rem;
    color: var(--text-faint);
  }
</style>
