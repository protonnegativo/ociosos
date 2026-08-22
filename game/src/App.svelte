<script lang="ts">
  import { onMount } from "svelte";
  import {
    game,
    production,
    intelFlow,
    equipFlow,
    activeBuff,
    alerta,
    offlineReport,
    threatEvent,
    toast,
    claimAlerta,
    startLoop,
    availableUpgrades,
    canRestructure,
    tabUnlocked,
    markTabSeen,
    totalRecruited,
    heroesAssignedToDepartment,
    tutorialActive,
    pendingDossies,
    currentDossieCap,
    dossieProgress,
    atDossieCap,
    availableHeroes,
    opAvailable,
    heroVisualTier,
    heroPrestiged,
    type BuyAmount,
  } from "./lib/game/state";
  import { threatThreshold, threatFor } from "./lib/game/threats";
  import { OPERATIONS } from "./lib/game/operations";
  import { BODIES } from "./lib/game/bodies";
  import { HEROES } from "./lib/game/heroes";
  import { currentObjective } from "./lib/game/objectives";
  import { now } from "./lib/game/clock";
  import { formatNumber, formatRate, formatDuration } from "./lib/game/format";
  import HeroesTab from "./lib/ui/HeroesTab.svelte";
  import UpgradesTab from "./lib/ui/UpgradesTab.svelte";
  import ProtocolsTab from "./lib/ui/ProtocolsTab.svelte";
  import OperationsTab from "./lib/ui/OperationsTab.svelte";
  import TrophiesTab from "./lib/ui/TrophiesTab.svelte";
  import StatsTab from "./lib/ui/StatsTab.svelte";
  import TutorialPanel from "./lib/ui/TutorialPanel.svelte";
  import DebugPanel from "./lib/ui/DebugPanel.svelte";
  import HeroBody from "./lib/ui/HeroBody.svelte";

  onMount(() => startLoop());

  type TabId = "efetivo" | "operacoes" | "melhorias" | "protocolos" | "condecoracoes" | "stats";
  let tab = $state<TabId>("efetivo");
  let buyAmount = $state<BuyAmount>(1);

  const BUY_OPTIONS: BuyAmount[] = [1, 10, 100, "max"];

  // Toast auto-dismiss.
  let liveToast = $state<{ id: number; text: string; tone: string } | null>(null);
  $effect(() => {
    const t = $toast;
    if (!t) return;
    liveToast = t;
    const timer = setTimeout(() => (liveToast = null), 4000);
    return () => clearTimeout(timer);
  });

  let showOffline = $state(true);
  let showThreat = $state(false);
  $effect(() => {
    if ($threatEvent) {
      showThreat = true;
      const timer = setTimeout(() => (showThreat = false), 3000);
      return () => clearTimeout(timer);
    }
  });

  let buffLeft = $derived($activeBuff ? Math.max(0, $activeBuff.until - $now) : 0);

  let threshold = $derived(threatThreshold($game.threat));
  let threat = $derived(threatFor($game.threat));
  let threatPct = $derived(clampPercent($production.toNumber(), threshold.toNumber()));
  function clampPercent(v: number, max: number): number {
    if (!Number.isFinite(v) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, (v / max) * 100));
  }

  // Badge counts tell the player where there's something new to spend on.
  let upgradeCount = $derived(availableUpgrades($game).filter((u) => $game.verba.gte(u.cost)).length);
  let restructureReady = $derived(canRestructure($game));
  let opsReady = $derived(
    OPERATIONS.filter((o) => opAvailable($game, o) && availableHeroes($game).length >= o.slots).length,
  );

  const ALL_TABS = [
    { id: "efetivo" as const, label: "Efetivo" },
    { id: "operacoes" as const, label: "Operações" },
    { id: "melhorias" as const, label: "Melhorias" },
    { id: "protocolos" as const, label: "Reestruturar" },
    { id: "condecoracoes" as const, label: "Condecorações" },
    { id: "stats" as const, label: "Relatório" },
  ];

  const BADGES: Record<string, () => number> = {
    operacoes: () => opsReady,
    melhorias: () => upgradeCount,
    protocolos: () => (restructureReady ? 1 : 0),
  };

  // Tabs arrive one at a time, each right after the thing that makes it useful.
  let tabs = $derived(
    ALL_TABS.filter((t) => tabUnlocked($game, t.id)).map((t) => ({
      ...t,
      badge: BADGES[t.id]?.() ?? 0,
      fresh: !$game.seenTabs.includes(t.id),
    })),
  );

  function openTab(id: TabId) {
    tab = id;
    markTabSeen(id);
  }

  // A tab can disappear on restructuring; never leave the player on a dead one.
  $effect(() => {
    if (!tabUnlocked($game, tab)) tab = "efetivo";
  });

  let objective = $derived(
    currentObjective($game, $production, totalRecruited($game), heroesAssignedToDepartment($game, "investigacao").length),
  );
  let objectivePct = $derived(
    objective.target > 0 ? Math.min(100, (objective.current / objective.target) * 100) : 0,
  );

  // Prototype: only heroes with art in BODIES get the full-body poster
  // treatment for now. Everyone else stays a round face portrait elsewhere.
  let posterHeroes = $derived(
    HEROES.filter((h) => BODIES[h.id] && ($game.levels[h.id] ?? 0) > 0).map((h) => ({
      def: h,
      tier: heroVisualTier($game, h.id),
      prestiged: heroPrestiged($game, h.id),
    })),
  );
</script>

<div class="page">
  <header class="topbar">
    <span class="brand display">Ociosos</span>
    <span class="tagline label">E.S.C.U.D.O. · Escritório Superior de Coordenação de Unidades Descomunais e Ocorrências</span>
  </header>

  <div class="layout">
    <aside class="sidebar">
      <div class="fama-block">
        <div class="fama-count display">{formatNumber($game.verba)}</div>
        <div class="fama-label label">Verba</div>
      </div>

      <div class="rate-badge" class:producing={$production.gt(0)}>
        <span class="rate-arrow">▲</span>
        <span class="rate-value mono">{formatRate($production)}</span>
      </div>

      {#if $activeBuff}
        <div class="buff-badge" >
          <span class="buff-label">{$activeBuff.label}</span>
          <span class="buff-time mono">{Math.ceil(buffLeft / 1000)}s</span>
        </div>
      {/if}

      {#if $game.intel > 0 || $intelFlow > 0 || $game.equipamento > 0 || $equipFlow > 0}
      <div class="support">
        <div class="support-row">
          <span class="support-label">🔍 Intel</span>
          <span class="support-val mono">{Math.floor($game.intel)}</span>
          <span class="support-rate mono">+{$intelFlow.toFixed(2)}/s</span>
        </div>
        <div class="support-row">
          <span class="support-label">🔩 Equip.</span>
          <span class="support-val mono">{Math.floor($game.equipamento)}</span>
          <span class="support-rate mono">+{$equipFlow.toFixed(2)}/s</span>
        </div>
      </div>
      {/if}

      <div class="boss-panel">
        <div class="boss-head">
          <span class="label">Ameaça nível {$game.threat}</span>
          <span class="boss-emoji">{threat.emoji}</span>
        </div>
        <div class="boss-name display">{threat.name}</div>
        <div class="boss-taunt">“{threat.taunt}”</div>
        <div class="boss-bar-row">
          <div class="boss-bar">
            <div class="boss-bar-fill" style="width: {threatPct}%"></div>
          </div>
          <span class="boss-goal mono">{formatRate(threshold)}</span>
        </div>
        <div class="boss-current mono">▲ {formatRate($production)} agora</div>
      </div>

      {#if tabUnlocked($game, "protocolos")}
      <div class="frag-block" class:full={atDossieCap($game)}>
        <div class="frag-head">
          <span class="frag-title label">Reestruturação</span>
          <span class="frag-count mono">
            🗂️ {formatNumber(pendingDossies($game), 0)}<span class="frag-cap"
              >/{currentDossieCap($game).toLocaleString("pt-BR")}</span
            >
          </span>
        </div>
        <div class="frag-bar">
          <div class="frag-fill" style="width: {dossieProgress($game) * 100}%"></div>
        </div>
        {#if $game.dossies.gt(0)}
          <div class="frag-banked mono">{formatNumber($game.dossies, 0)} arquivados</div>
        {/if}
      </div>
      {/if}

      {#if posterHeroes.length > 0}
        <div class="poster-panel">
          <span class="poster-title label">Efetivo</span>
          <div class="poster-block">
            {#each posterHeroes as p (p.def.id)}
              <div class="poster-card">
                <HeroBody heroId={p.def.id} tier={p.tier} prestiged={p.prestiged} width={140} />
                <span class="poster-name">{p.def.name}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </aside>

    <main class="main">
      {#if tutorialActive($game)}
        <TutorialPanel onOpenTab={(t) => openTab(t as TabId)} />
      {:else}
        <button class="objective" onclick={() => openTab(objective.tab as TabId)}>
          <span class="obj-label label">Próximo passo</span>
          <span class="obj-text">{objective.text}</span>
          <span class="obj-bar"><span class="obj-fill" style="width: {objectivePct}%"></span></span>
          <span class="obj-count mono">{objective.current}/{objective.target}</span>
        </button>
      {/if}

      <nav class="tabs">
        {#each tabs as t (t.id)}
          <button class="tab" class:active={tab === t.id} onclick={() => openTab(t.id)}>
            {t.label}
            {#if t.fresh}<span class="tab-new">novo</span>{/if}
            {#if t.badge > 0}<span class="tab-badge">{t.badge}</span>{/if}
          </button>
        {/each}
      </nav>

      {#if tab === "efetivo"}
        <div class="tab-toolbar">
          <span class="toolbar-label label">Comprar</span>
          {#each BUY_OPTIONS as opt (opt)}
            <button class="buy-opt" class:active={buyAmount === opt} onclick={() => (buyAmount = opt)}>
              {opt === "max" ? "Máx" : `×${opt}`}
            </button>
          {/each}
        </div>
        <HeroesTab {buyAmount} />
      {:else if tab === "operacoes"}
        <OperationsTab />
      {:else if tab === "melhorias"}
        <UpgradesTab />
      {:else if tab === "protocolos"}
        <ProtocolsTab />
      {:else if tab === "condecoracoes"}
        <TrophiesTab />
      {:else}
        <StatsTab />
      {/if}

      <footer>
        <p>Progresso salvo neste navegador · offline a 70% da produção, limitado pelo Protocolo Turno Noturno</p>
      </footer>
    </main>
  </div>
</div>

{#if $alerta}
  <button class="alerta-dock" onclick={claimAlerta}>
    <span class="alerta-icon">🚨</span>
    <span class="alerta-text">
      <span class="alerta-title label">Alerta Prioritário</span>
      <span class="alerta-sub">clique para atender</span>
    </span>
  </button>
{/if}

<div class="toast-stack">
  {#if $offlineReport && showOffline}
    <div class="toast gold">
      <p>
        Ausente por {formatDuration($offlineReport.ms)}. A agência seguiu operando:
        <strong>+{formatNumber($offlineReport.gained)} de Verba</strong>
      </p>
      <button class="btn-ghost" onclick={() => (showOffline = false)}>Fechar</button>
    </div>
  {/if}

  {#if $threatEvent && showThreat}
    <div class="toast red">
      <p>
        {$threatEvent.emoji}
        <strong>{$threatEvent.name}</strong> neutralizada. Ameaça nível {$threatEvent.level} encerrada —
        <strong>+{formatNumber($threatEvent.reward)} de Verba</strong>
      </p>
    </div>
  {/if}

  {#if liveToast}
    <div class="toast {liveToast.tone}">
      <p>{liveToast.text}</p>
    </div>
  {/if}
</div>

<DebugPanel onReset={() => (tab = "efetivo")} />

<style>
  .page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 1.5rem 3rem;
  }
  .topbar {
    display: flex;
    align-items: baseline;
    gap: 0.7rem;
    padding: 1.25rem 0 1rem;
  }
  .brand {
    font-size: 1.6rem;
    color: var(--power-gold);
  }
  .tagline {
    font-size: 0.7rem;
    color: var(--text-faint);
  }

  .layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .sidebar {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 16px;
    padding: 1.4rem 1.2rem;
  }

  .fama-block {
    text-align: center;
  }
  .fama-count {
    font-size: clamp(2rem, 3.6vw, 2.6rem);
    color: var(--power-gold);
    line-height: 1;
    text-shadow: 2px 2px 0 var(--hero-red-ink);
    word-break: break-word;
  }
  .fama-label {
    font-size: 0.72rem;
    color: var(--text-faint);
    margin-top: 0.2rem;
  }

  .rate-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background: color-mix(in srgb, var(--gain-green) 14%, var(--panel-raised));
    border: 1.5px solid var(--gain-green-ink);
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
  }
  .rate-badge.producing {
    animation: pulse-glow 2.4s ease-in-out infinite;
  }
  .rate-arrow {
    color: var(--gain-green);
    font-size: 0.85rem;
  }
  .rate-value {
    color: var(--gain-green);
    font-weight: 600;
    font-size: 1.02rem;
  }
  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--gain-green) 35%, transparent);
    }
    50% {
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--gain-green) 0%, transparent);
    }
  }

  .buff-badge {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    background: color-mix(in srgb, var(--power-gold) 22%, var(--panel-raised));
    border: 1px solid var(--power-gold);
    border-radius: 8px;
    padding: 0.4rem 0.7rem;
    font-size: 0.74rem;
    color: var(--power-gold);
  }
  .buff-badge.punho {
    background: color-mix(in srgb, var(--hero-red) 22%, var(--panel-raised));
    border-color: var(--hero-red);
    color: var(--hero-red);
  }
  .buff-label {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .support {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.55rem 0.7rem;
  }
  .support-row {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
  }
  .support-label {
    flex: 1;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-soft);
  }
  .support-val {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--sky-blue);
  }
  .support-rate {
    font-size: 0.64rem;
    color: var(--text-faint);
    min-width: 4.2em;
    text-align: right;
  }

  .boss-panel {
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.8rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .boss-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .boss-head .label {
    font-size: 0.68rem;
    color: var(--text-faint);
  }
  .boss-emoji {
    font-size: 1.1rem;
  }
  .boss-name {
    font-size: 1.02rem;
    color: var(--hero-red);
    line-height: 1.1;
  }
  .boss-taunt {
    font-size: 0.68rem;
    font-style: italic;
    color: var(--text-faint);
    margin-bottom: 0.2rem;
  }
  .boss-bar-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .boss-bar {
    flex: 1;
    min-width: 0;
    height: 9px;
    border-radius: 999px;
    background: var(--ink);
    border: 1px solid var(--rule);
    overflow: hidden;
  }
  .boss-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--hero-red-ink), var(--hero-red));
    transition: width 0.2s ease-out;
  }
  .boss-goal {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--hero-red);
  }
  .boss-current {
    font-size: 0.66rem;
    color: var(--text-faint);
  }

  .poster-panel {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    background: linear-gradient(160deg, var(--panel-raised), var(--panel) 85%);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.9rem 0.8rem 1rem;
  }
  .poster-title {
    font-size: 0.7rem;
    color: var(--power-gold);
    text-align: center;
    letter-spacing: 0.1em;
  }
  .poster-block {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7rem 0.5rem;
  }
  .poster-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }
  .poster-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-size: 0.66rem;
    text-align: center;
    color: var(--text-soft);
  }

  .frag-block {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background: color-mix(in srgb, var(--fragment-cyan) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--fragment-cyan) 35%, transparent);
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
  }
  .frag-block.full {
    border-color: var(--fragment-cyan);
  }
  .frag-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }
  .frag-title {
    font-size: 0.62rem;
    color: var(--text-faint);
  }
  .frag-count {
    font-size: 0.8rem;
    color: var(--fragment-cyan);
    font-weight: 600;
  }
  .frag-cap {
    opacity: 0.6;
    font-weight: 400;
  }
  .frag-bar {
    height: 6px;
    border-radius: 999px;
    background: var(--ink);
    border: 1px solid color-mix(in srgb, var(--fragment-cyan) 25%, var(--rule));
    overflow: hidden;
  }
  .frag-fill {
    height: 100%;
    background: var(--fragment-cyan);
    transition: width 0.2s ease-out;
  }
  .frag-block.full .frag-fill {
    animation: frag-pulse 2s ease-in-out infinite;
  }
  @keyframes frag-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
  .frag-banked {
    font-size: 0.64rem;
    color: var(--text-faint);
  }

  .main {
    min-width: 0;
  }

  .objective {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "label text count"
      "bar bar bar";
    align-items: center;
    gap: 0.3rem 0.6rem;
    width: 100%;
    text-align: left;
    background: color-mix(in srgb, var(--sky-blue) 12%, var(--panel));
    border: 1px solid color-mix(in srgb, var(--sky-blue) 45%, transparent);
    border-radius: 10px;
    padding: 0.55rem 0.8rem;
    margin-bottom: 0.8rem;
    color: var(--paper);
  }
  .objective:hover {
    border-color: var(--sky-blue);
  }
  .obj-label {
    grid-area: label;
    font-size: 0.6rem;
    color: var(--sky-blue);
  }
  .obj-text {
    grid-area: text;
    font-size: 0.86rem;
  }
  .obj-count {
    grid-area: count;
    font-size: 0.7rem;
    color: var(--text-faint);
  }
  .obj-bar {
    grid-area: bar;
    height: 5px;
    border-radius: 999px;
    background: var(--ink);
    overflow: hidden;
  }
  .obj-fill {
    display: block;
    height: 100%;
    background: var(--sky-blue);
    transition: width 0.4s ease-out;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-bottom: 0.9rem;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 0.5rem;
  }
  .tab {
    position: relative;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-faint);
    border-radius: 8px;
    padding: 0.4rem 0.8rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.82rem;
  }
  .tab:hover {
    color: var(--paper);
  }
  .tab.active {
    background: var(--panel);
    border-color: var(--rule);
    color: var(--power-gold);
  }
  .tab-new {
    display: inline-block;
    margin-left: 0.3rem;
    background: var(--sky-blue);
    color: #06121f;
    border-radius: 20px;
    font-size: 0.58rem;
    padding: 0.02rem 0.35rem;
    vertical-align: middle;
    letter-spacing: 0.06em;
  }
  .tab-badge {
    display: inline-block;
    margin-left: 0.35rem;
    background: var(--gain-green);
    color: #06170a;
    border-radius: 20px;
    font-size: 0.62rem;
    padding: 0.02rem 0.35rem;
    vertical-align: middle;
  }

  .tab-toolbar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.7rem;
  }
  .toolbar-label {
    font-size: 0.68rem;
    color: var(--text-faint);
    margin-right: 0.2rem;
  }
  .buy-opt {
    background: var(--panel);
    border: 1px solid var(--rule);
    color: var(--text-soft);
    border-radius: 6px;
    padding: 0.25rem 0.6rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
  }
  .buy-opt.active {
    background: color-mix(in srgb, var(--power-gold) 22%, var(--panel));
    border-color: var(--power-gold);
    color: var(--power-gold);
  }

  footer {
    text-align: center;
    margin-top: 1.4rem;
  }
  footer p {
    font-size: 0.68rem;
    color: var(--text-faint);
    margin: 0;
  }

  /* Priority alert — docked, never overlapping the play area */
  .alerta-dock {
    position: fixed;
    left: 1rem;
    bottom: 1rem;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: color-mix(in srgb, var(--power-gold) 22%, var(--panel));
    border: 2px solid var(--power-gold);
    border-radius: 12px;
    padding: 0.6rem 0.9rem;
    color: var(--paper);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--ink) 70%, transparent);
    animation: alerta-pulse 1.4s ease-in-out infinite;
  }
  .alerta-dock:hover {
    background: color-mix(in srgb, var(--power-gold) 34%, var(--panel));
  }
  .alerta-icon {
    font-size: 1.6rem;
    line-height: 1;
  }
  .alerta-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
  }
  .alerta-title {
    font-size: 0.72rem;
    color: var(--power-gold);
  }
  .alerta-sub {
    font-size: 0.64rem;
    color: var(--text-soft);
  }
  @keyframes alerta-pulse {
    0%,
    100% {
      box-shadow: 0 6px 20px color-mix(in srgb, var(--ink) 70%, transparent);
    }
    50% {
      box-shadow:
        0 6px 20px color-mix(in srgb, var(--ink) 70%, transparent),
        0 0 0 6px color-mix(in srgb, var(--power-gold) 22%, transparent);
    }
  }

  .toast-stack {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 45;
    width: min(380px, 90vw);
    display: flex;
    flex-direction: column-reverse;
    gap: 0.5rem;
    /* Never intercept a click meant for the game underneath. */
    pointer-events: none;
  }
  .toast-stack :global(button) {
    pointer-events: auto;
  }
  .toast {
    animation: toast-in 0.18s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
    font-size: 0.84rem;
    box-shadow: 0 6px 18px color-mix(in srgb, var(--ink) 65%, transparent);
    background: color-mix(in srgb, var(--power-gold) 20%, var(--panel));
    border: 1px solid var(--power-gold);
  }
  .toast p {
    margin: 0;
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .toast.red {
    background: color-mix(in srgb, var(--hero-red) 22%, var(--panel));
    border-color: var(--hero-red);
  }
  .toast.green {
    background: color-mix(in srgb, var(--gain-green) 18%, var(--panel));
    border-color: var(--gain-green-ink);
  }
  .toast strong {
    color: var(--power-gold);
  }
  .toast.red strong {
    color: var(--hero-red);
  }

  @media (max-width: 820px) {
    .page {
      padding: 0 1rem 3rem;
    }
    .layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      position: sticky;
      top: 0;
      z-index: 15;
      border-radius: 0 0 14px 14px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.6rem;
      padding: 0.8rem 1rem;
      align-items: center;
    }
    .fama-block {
      text-align: left;
    }
    .fama-count {
      font-size: 1.6rem;
    }
    .boss-panel,
    .frag-badge {
      grid-column: 1 / -1;
    }
  }

</style>
