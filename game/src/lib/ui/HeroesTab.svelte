<script lang="ts">
  import {
    game,
    production,
    trainHero,
    heroCostBulk,
    heroOutput,
    levelsToBuy,
    factionSynergy,
    purchaseImpact,
    isDeployed,
    assignedDepartment,
    protocolLevel,
    heroAutoLocked,
    toggleHeroAutoLock,
    type BuyAmount,
  } from "../game/state";
  import { activeBuff } from "../game/state";
  import { DEFAULT_DEPARTMENT } from "../game/departments";
  import { HEROES, FACTION_COLOR, ROLE_ICON, milestoneMultiplier, nextMilestone } from "../game/heroes";
  import DepartmentBoard from "./DepartmentBoard.svelte";
  import HeroPortrait from "./HeroPortrait.svelte";
  import { formatNumber, formatRate, timeToAfford } from "../game/format";

  let { buyAmount }: { buyAmount: BuyAmount } = $props();

  let expanded = $state<Set<string>>(new Set());
  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expanded = next;
  }

  let automationUnlocked = $derived(protocolLevel($game, "autonomo") > 0);

  let rows = $derived(
    HEROES.map((def) => {
      const level = $game.levels[def.id] ?? 0;
      const n = levelsToBuy(def, level, $game.verba, buyAmount);
      // When 10x/100x isn't affordable, n comes back 0 — but the card should
      // still price and preview the batch the player actually selected, not
      // silently fall back to a single level.
      const shown = n > 0 ? n : buyAmount === "max" ? 1 : buyAmount;
      const cost = heroCostBulk(def, level, shown);

      // Measured as if the hero were on patrol. Posted to a department they add
      // no Verba, so the raw impact reads +0 — true but useless, since what the
      // player is deciding is how strong this hero gets.
      const onPatrol = assignedDepartment($game, def.id) === DEFAULT_DEPARTMENT && !isDeployed($game, def.id);
      const patrolState = onPatrol
        ? $game
        : { ...$game, assignments: { ...$game.assignments, [def.id]: DEFAULT_DEPARTMENT }, activeOps: [] };
      const buyGain = purchaseImpact(patrolState, def, shown, $activeBuff);

      return {
        def,
        level,
        recruited: level > 0,
        deployed: isDeployed($game, def.id),
        buyCount: n,
        shownCount: shown,
        cost,
        affordable: n > 0,
        output: heroOutput($game, def, $activeBuff),
        milestone: milestoneMultiplier(level),
        next: nextMilestone(level),
        synergy: factionSynergy($game, def.faction),
        wait: timeToAfford(cost, $game.verba, $production),
        buyGain,
        onPatrol,
        locked: heroAutoLocked($game, def.id),
        isFocus: $game.focusHero === def.id,
      };
    }),
  );

</script>

<DepartmentBoard />

<h3 class="roster-head label">Efetivo — alistar e treinar</h3>

<div class="roster">
  {#each rows as row (row.def.id)}
    <div
      class="hero-card"
      class:affordable={row.affordable}
      class:expanded={expanded.has(row.def.id)}
      style="--faction-color: {FACTION_COLOR[row.def.faction]}"
    >
      <HeroPortrait def={row.def} level={row.level} size={48} />

      <div class="hero-info">
        <div class="hero-top">
          <span class="hero-name">{row.def.name}</span>
          {#if automationUnlocked && row.recruited}
            <button
              type="button"
              class="lock-toggle"
              class:active={row.locked}
              title={row.locked
                ? "Reservado — treino e operações automáticas não mexem nele"
                : "Reservar este herói (tirar da automação)"}
              onclick={() => toggleHeroAutoLock(row.def.id)}
            >
              {row.locked ? "🔒" : "🔓"}
            </button>
          {/if}
        </div>

        <div class="hero-meta">
          <span class="role-icon">{ROLE_ICON[row.def.role] ?? "•"}</span>
          {row.def.role} · {row.def.faction}
        </div>

        <button type="button" class="flavor-toggle" onclick={() => toggleExpand(row.def.id)}>
          <span class="flavor-text">{row.def.flavor}</span>
          <span class="flavor-chevron">{expanded.has(row.def.id) ? "▾" : "▸"}</span>
        </button>

        <div class="hero-chips">
          {#if row.deployed}
            <span class="chip chip-cyan">🎯 em campo</span>
            <span class="chip chip-gold">NV {row.level}</span>
          {:else if row.recruited}
            {#if row.isFocus}
              <span class="chip chip-gold">👑 FOCO</span>
            {/if}
            <span class="chip chip-gold">NV {row.level}</span>
            <span class="chip chip-green">▲ {formatRate(row.output)}</span>
            {#if row.milestone > 1}
              <span class="chip chip-cyan">marco ×{row.milestone}</span>
            {/if}
            {#if row.synergy > 1}
              <span class="chip chip-muted">facção +{Math.round((row.synergy - 1) * 100)}%</span>
            {/if}
          {:else}
            <span class="chip chip-muted">🔒 não alistado</span>
          {/if}
        </div>

        {#if row.recruited && row.next}
          <div class="milestone-hint mono">
            faltam {row.next - row.level} níveis para ×2
          </div>
        {/if}
      </div>

      <button class="buy-btn" disabled={!row.affordable} onclick={() => trainHero(row.def.id, buyAmount)}>
        <span class="label">
          {row.recruited ? "Treinar" : "Alistar"}
          {#if row.shownCount > 1}<span class="qty">×{row.shownCount}</span>{/if}
        </span>
        <span class="mono cost">{row.cost.lte(0) ? "grátis" : formatNumber(row.cost, 0)}</span>
        <span class="mono gain">↗ +{formatRate(row.buyGain)}</span>
        {#if !row.onPatrol}<span class="mono gain-note">se em patrulha</span>{/if}
        <span class="mono wait" style:visibility={!row.affordable && row.wait ? "visible" : "hidden"}>em {row.wait || "0s"}</span>
      </button>
    </div>
  {/each}
</div>

<style>
  .roster {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 0.6rem;
  }

  .hero-card {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-left: 3px solid var(--faction-color);
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
    transition: border-color 0.15s ease;
  }
  .hero-card.affordable {
    border-color: color-mix(in srgb, var(--power-gold) 55%, var(--rule));
    border-left-color: var(--faction-color);
  }

  .hero-info {
    flex: 1;
    min-width: 0;
  }
  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }
  .lock-toggle {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    font-size: 0.82rem;
    line-height: 1;
    opacity: 0.5;
  }
  .lock-toggle:hover {
    opacity: 0.85;
  }
  .lock-toggle.active {
    opacity: 1;
  }
  .hero-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-size: 0.88rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hero-card.expanded .hero-name {
    white-space: normal;
    overflow: visible;
  }
  .hero-meta {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    color: var(--text-faint);
    margin-top: 0.05rem;
  }
  .role-icon {
    font-size: 0.78rem;
  }

  .flavor-toggle {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    margin: 0.25rem 0;
    text-align: left;
  }
  .flavor-text {
    flex: 1;
    min-width: 0;
    font-size: 0.74rem;
    font-style: italic;
    color: var(--text-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .flavor-toggle:hover .flavor-text {
    color: var(--paper);
  }
  .flavor-chevron {
    flex-shrink: 0;
    font-size: 0.62rem;
    color: var(--text-faint);
    margin-top: 0.2rem;
  }
  .hero-card.expanded .flavor-text {
    white-space: normal;
    overflow: visible;
  }

  .hero-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.15rem;
  }



  .roster-head {
    font-size: 0.75rem;
    color: var(--text-faint);
    margin: 0 0 0.6rem;
  }
  .milestone-hint {
    font-size: 0.64rem;
    color: var(--fragment-cyan);
    margin-top: 0.25rem;
    opacity: 0.8;
  }


  .buy-btn {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    color: var(--paper);
    min-width: 104px;
    transition:
      background 0.15s ease,
      transform 0.08s ease;
  }
  .buy-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .buy-btn:not(:disabled) {
    background: color-mix(in srgb, var(--power-gold) 22%, var(--panel-raised));
    border-color: var(--power-gold);
  }
  .buy-btn:not(:disabled):hover {
    background: color-mix(in srgb, var(--power-gold) 34%, var(--panel-raised));
    transform: translateY(-1px);
  }
  .buy-btn .label {
    font-size: 0.7rem;
  }
  .buy-btn .qty {
    color: var(--gain-green);
  }
  .buy-btn .cost {
    font-size: 0.76rem;
    color: var(--power-gold);
  }
  .buy-btn:disabled .cost {
    color: var(--text-faint);
  }
  .buy-btn .gain {
    font-size: 0.62rem;
    color: var(--gain-green);
  }
  .buy-btn:disabled .gain {
    color: color-mix(in srgb, var(--gain-green) 55%, var(--text-faint));
  }
  .buy-btn .gain-note {
    font-size: 0.54rem;
    color: var(--text-faint);
  }
  .buy-btn .wait {
    font-size: 0.6rem;
    color: var(--text-faint);
  }
</style>
