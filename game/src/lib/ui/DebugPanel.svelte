<script lang="ts">
  import {
    game,
    debugSetVerba,
    debugAddVerba,
    debugAddDossies,
    debugAddSupport,
    debugSpawnAlerta,
    resetSave,
  } from "../game/state";
  import { formatNumber } from "../game/format";

  // Called after a reset so the host can drop the player back on a live tab.
  let { onReset }: { onReset: () => void } = $props();

  let open = $state(false);
  let value = $state("1000");
  let confirmingReset = $state(false);

  function doReset() {
    resetSave();
    confirmingReset = false;
    onReset();
  }
</script>

<button class="debug-tab mono" class:open onclick={() => (open = !open)}>
  {open ? "✕" : "DEBUG"}
</button>

<aside class="debug-panel" class:open>
  <div class="debug-title label">Painel de debug</div>
  <p class="debug-current mono">Verba: {formatNumber($game.verba)}</p>
  <label class="debug-label label" for="dbg">Valor</label>
  <input id="dbg" class="debug-input mono" type="text" inputmode="decimal" bind:value />
  <div class="debug-actions">
    <button class="debug-btn" onclick={() => debugSetVerba(value)}>Definir</button>
    <button class="debug-btn" onclick={() => debugAddVerba(value)}>Somar</button>
  </div>
  <p class="debug-hint">Aceita negativo e notação tipo 1e12.</p>
  <div class="debug-sep"></div>
  <button class="debug-btn wide" onclick={() => debugAddDossies(50)}>+50 dossiês</button>
  <button class="debug-btn wide" onclick={() => debugAddSupport(500)}>+500 intel/equip</button>
  <button class="debug-btn wide" onclick={debugSpawnAlerta}>Disparar alerta</button>

  <div class="debug-sep"></div>
  {#if confirmingReset}
    <p class="debug-hint">Apaga tudo e reinicia o tutorial.</p>
    <div class="debug-actions">
      <button class="debug-btn" onclick={() => (confirmingReset = false)}>cancelar</button>
      <button class="debug-btn danger" onclick={doReset}>confirmar</button>
    </div>
  {:else}
    <button class="debug-btn wide danger" onclick={() => (confirmingReset = true)}>Resetar do zero</button>
  {/if}
</aside>

<style>
  .debug-tab {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 50;
    writing-mode: vertical-rl;
    background: #111;
    color: #5cf27a;
    border: 1px dashed #5cf27a;
    border-right: none;
    border-radius: 8px 0 0 8px;
    padding: 0.7rem 0.4rem;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    transition: right 0.2s ease;
  }
  .debug-tab.open {
    right: 220px;
  }
  .debug-panel {
    position: fixed;
    top: 0;
    right: -240px;
    width: 220px;
    height: 100%;
    z-index: 49;
    background: #111;
    color: #d6ffe0;
    border-left: 1px dashed #5cf27a;
    padding: 1rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: right 0.2s ease;
    overflow-y: auto;
  }
  .debug-panel.open {
    right: 0;
  }
  .debug-title {
    color: #5cf27a;
    font-size: 0.75rem;
  }
  .debug-current {
    font-size: 0.76rem;
    margin: 0 0 0.3rem;
  }
  .debug-label {
    font-size: 0.66rem;
    color: #8fd9a0;
  }
  .debug-input {
    background: #0a0a0a;
    border: 1px solid #2f5c3a;
    color: #d6ffe0;
    border-radius: 6px;
    padding: 0.4rem 0.5rem;
    font-size: 0.84rem;
    width: 100%;
  }
  .debug-actions {
    display: flex;
    gap: 0.5rem;
  }
  .debug-btn {
    flex: 1;
    background: #1a2e1f;
    border: 1px solid #2f5c3a;
    color: #d6ffe0;
    border-radius: 6px;
    padding: 0.4rem 0;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.7rem;
  }
  .debug-btn:hover {
    border-color: #5cf27a;
  }
  .debug-btn.wide {
    width: 100%;
  }
  .debug-btn.danger {
    background: #2e1414;
    border-color: #6b2b2b;
    color: #ffb4b4;
  }
  .debug-btn.danger:hover {
    border-color: #ff6a52;
  }
  .debug-hint {
    font-size: 0.64rem;
    color: #6a8f76;
    margin: 0.2rem 0 0;
  }
  .debug-sep {
    height: 1px;
    background: #2f5c3a;
    margin: 0.4rem 0;
  }
</style>
