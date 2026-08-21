<script lang="ts">
  import {
    game,
    production,
    intelPerSecond,
    equipPerSecond,
    globalMult,
    activeBuff,
    totalRecruited,
    achievementMult,
    protocolLevel,
    offlineCapMs,
    exportSave,
    importSave,
    resetSave,
    pushToast,
  } from "../game/state";
  import { threatMultiplier } from "../game/threats";
  import { HEROES } from "../game/heroes";
  import { formatNumber, formatRate, formatDuration, formatMultiplier } from "../game/format";

  let importText = $state("");
  let showImport = $state(false);
  let confirmingReset = $state(false);

  let runTime = $derived(Date.now() - $game.runStart);

  async function copyExport() {
    const code = exportSave();
    try {
      await navigator.clipboard.writeText(code);
      pushToast("Save copiado para a área de transferência", "green");
    } catch {
      // Clipboard can be blocked; show the code so it can be copied by hand.
      importText = code;
      showImport = true;
      pushToast("Copie o código do campo abaixo", "gold");
    }
  }

  function doImport() {
    if (importSave(importText)) {
      pushToast("Save carregado", "green");
      showImport = false;
      importText = "";
    } else {
      pushToast("Código de save inválido", "red");
    }
  }

  let rows = $derived([
    { k: "Verba agora", v: formatNumber($game.verba) },
    { k: "Produção", v: formatRate($production) },
    { k: "Intel", v: `${Math.floor($game.intel)} (+${intelPerSecond($game).toFixed(2)}/s)` },
    { k: "Equipamento", v: `${Math.floor($game.equipamento)} (+${equipPerSecond($game).toFixed(2)}/s)` },
    { k: "Verba nesta administração", v: formatNumber($game.totalVerbaThisRun) },
    { k: "Verba desde sempre", v: formatNumber($game.lifetimeVerba) },
    { k: "Dossiês", v: formatNumber($game.dossies, 0) },
    { k: "Ameaça atual", v: String($game.threat) },
    { k: "Maior ameaça enfrentada", v: String($game.maxThreat) },
    { k: "Heróis alistados", v: `${totalRecruited($game)} / ${HEROES.length}` },
    { k: "Heróis em campo", v: String($game.activeOps.reduce((n, o) => n + o.heroIds.length, 0)) },
    { k: "Operações concluídas", v: String($game.opsCompleted) },
    { k: "Melhorias vigentes", v: String($game.upgrades.length) },
    { k: "Condecorações", v: String($game.achievements.length) },
    { k: "Alertas atendidos", v: String($game.alertsClaimed) },
    { k: "Reestruturações", v: String($game.restructurings) },
    { k: "Tempo desta administração", v: formatDuration(runTime) },
    { k: "Limite offline", v: `${offlineCapMs($game) / 3_600_000}h` },
  ]);

  let breakdown = $derived([
    { k: "Doutrina de Campo", v: `${1 + 0.25 * protocolLevel($game, "doutrina")}x` },
    { k: "Ameaças neutralizadas", v: threatMultiplier($game.maxThreat).toFixed(2) + "x" },
    { k: "Condecorações", v: achievementMult($game).toFixed(2) + "x" },
    { k: "Sinergia Interdepartamental", v: `${(1 + 0.03 * protocolLevel($game, "interdepartamental") * totalRecruited($game)).toFixed(2)}x` },
    { k: "Operação especial ativa", v: $activeBuff?.kind === "forca" ? `${$activeBuff.mult}x` : "1.00x" },
    { k: "Multiplicador global total", v: formatMultiplier($globalMult), strong: true },
  ]);
</script>

<div class="wrap">
  <section>
    <h3 class="label section-title">Números</h3>
    <div class="stat-grid">
      {#each rows as r (r.k)}
        <div class="stat">
          <span class="stat-k">{r.k}</span>
          <span class="stat-v mono">{r.v}</span>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3 class="label section-title">De onde vem o multiplicador da agência</h3>
    <div class="stat-grid">
      {#each breakdown as r (r.k)}
        <div class="stat" class:strong={r.strong}>
          <span class="stat-k">{r.k}</span>
          <span class="stat-v mono">{r.v}</span>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3 class="label section-title">Save</h3>
    <div class="save-actions">
      <button class="btn-ghost" onclick={copyExport}>Exportar save</button>
      <button class="btn-ghost" onclick={() => (showImport = !showImport)}>Importar save</button>
      {#if confirmingReset}
        <button class="btn-ghost" onclick={() => (confirmingReset = false)}>Cancelar</button>
        <button
          class="danger"
          onclick={() => {
            resetSave();
            confirmingReset = false;
            pushToast("Agência dissolvida", "red");
          }}>Confirmar: apagar tudo</button
        >
      {:else}
        <button class="danger" onclick={() => (confirmingReset = true)}>Apagar tudo</button>
      {/if}
    </div>
    {#if showImport}
      <div class="import-row">
        <input class="import-input mono" bind:value={importText} placeholder="cole aqui o código do save" />
        <button class="btn-ghost" onclick={doImport}>Carregar</button>
      </div>
    {/if}
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
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 0.4rem;
  }
  .stat {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.6rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
  }
  .stat.strong {
    border-color: var(--power-gold);
  }
  .stat-k {
    font-size: 0.74rem;
    color: var(--text-faint);
  }
  .stat-v {
    font-size: 0.8rem;
    color: var(--paper);
    text-align: right;
  }
  .stat.strong .stat-v {
    color: var(--power-gold);
    font-weight: 600;
  }

  .save-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .danger {
    background: transparent;
    border: 1px solid var(--hero-red-ink);
    color: var(--hero-red);
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.78rem;
  }
  .danger:hover {
    background: color-mix(in srgb, var(--hero-red) 15%, transparent);
  }
  .import-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }
  .import-input {
    flex: 1;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    color: var(--paper);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    font-size: 0.78rem;
    min-width: 0;
  }
</style>
