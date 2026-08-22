<script lang="ts">
  import {
    game,
    doRestructure,
    canRestructure,
    pendingDossies,
    currentDossieCap,
    dossieProgress,
    atDossieCap,
    protocolLevel,
    setAutoTrain,
    setAutoSpendFraction,
    setAutoOps,
  } from "../game/state";
  import { formatNumber } from "../game/format";
  import ProtocolTree from "./ProtocolTree.svelte";

  let confirming = $state(false);
  let pending = $derived(pendingDossies($game));
  let ready = $derived(canRestructure($game));
  let cap = $derived(currentDossieCap($game));
  let capped = $derived(atDossieCap($game));
  let progress = $derived(dossieProgress($game) * 100);
  let autoUnlocked = $derived(protocolLevel($game, "autonomo") > 0);
  let autoOpsUnlocked = $derived(protocolLevel($game, "autonomo") >= 2);
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

      {#if autoOpsUnlocked}
        <div class="auto-sep"></div>
        <div class="auto-head">
          <span class="label">Operações automáticas</span>
          <label class="switch">
            <input type="checkbox" checked={$game.autoOps} onchange={(e) => setAutoOps(e.currentTarget.checked)} />
            <span>{$game.autoOps ? "Ligado" : "Desligado"}</span>
          </label>
        </div>
        <p class="auto-copy">
          Monta e despacha equipes sozinho, sempre puxando quem está de Patrulha — nunca tira ninguém da
          Investigação ou da Logística.
        </p>
      {/if}
    </section>
  {/if}

  <section>
    <h3 class="label section-title">Protocolos permanentes</h3>
    <p class="tree-hint">
      Cada Protocolo revela o próximo ao ser ativado — o efeito de cada um já aparece antes de comprar, só o ícone
      fica em segredo até lá.
    </p>
    <ProtocolTree />
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

  .auto-sep {
    height: 1px;
    background: var(--rule);
    margin: 0.2rem 0;
  }

  .tree-hint {
    font-size: 0.72rem;
    color: var(--text-faint);
    font-style: italic;
    margin: 0 0 0.8rem;
  }
</style>
