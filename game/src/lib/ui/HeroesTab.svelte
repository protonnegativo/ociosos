<script lang="ts">
  import {
    game,
    production,
    trainHero,
    heroCost,
    heroCostBulk,
    heroOutput,
    levelsToBuy,
    factionSynergy,
    purchaseImpact,
    isDeployed,
    assignedDepartment,
    assignHero,
    departmentSlots,
    heroesInDepartment,
    departmentUnlocked,
    type BuyAmount,
  } from "../game/state";
  import { activeBuff } from "../game/state";
  import { HEROES, FACTION_COLOR, ROLE_ICON, milestoneMultiplier, nextMilestone } from "../game/heroes";
  import { DEPARTMENTS, DEPARTMENTS_BY_ID } from "../game/departments";
  import { formatNumber, formatRate, timeToAfford } from "../game/format";

  let { buyAmount }: { buyAmount: BuyAmount } = $props();

  let expanded = $state<Set<string>>(new Set());
  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expanded = next;
  }

  let rows = $derived(
    HEROES.map((def) => {
      const level = $game.levels[def.id] ?? 0;
      const n = levelsToBuy(def, level, $game.verba, buyAmount);
      const shown = Math.max(1, n);
      const cost = n > 0 ? heroCostBulk(def, level, n) : heroCost(def, level);

      const buyGain = purchaseImpact($game, def, shown, $activeBuff, $production);

      return {
        def,
        level,
        recruited: level > 0,
        deployed: isDeployed($game, def.id),
        dept: assignedDepartment($game, def.id),
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
      };
    }),
  );

  // Post occupancy drives which chips are still clickable.
  let posts = $derived(
    DEPARTMENTS.map((d) => ({
      def: d,
      unlocked: departmentUnlocked($game, d),
      used: heroesInDepartment($game, d.id).length,
      slots: departmentSlots($game, d),
    })),
  );

  function postFull(deptId: string): boolean {
    const p = posts.find((x) => x.def.id === deptId);
    return !!p && p.used >= p.slots;
  }
</script>

<div class="posts-bar">
  {#each posts.filter((p) => p.unlocked) as p (p.def.id)}
    <span class="post-tag" class:full={!p.def.unlimited && p.used >= p.slots} title={p.def.desc}>
      {p.def.emoji} {p.def.name}
      <strong>{p.def.unlimited ? p.used : `${p.used}/${p.slots}`}</strong>
    </span>
  {/each}
</div>

<div class="roster">
  {#each rows as row (row.def.id)}
    <div
      class="hero-card"
      class:affordable={row.affordable}
      class:expanded={expanded.has(row.def.id)}
      style="--faction-color: {FACTION_COLOR[row.def.faction]}"
    >
      <div
        class="avatar"
        class:dim={!row.recruited}
        style="background: color-mix(in srgb, {FACTION_COLOR[row.def.faction]} 35%, var(--panel-raised)); border-color: {FACTION_COLOR[
          row.def.faction
        ]}"
      >
        {row.def.emoji}
      </div>

      <div class="hero-info">
        <div class="hero-top">
          <span class="hero-name">{row.def.name}</span>
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
          {#if row.recruited}
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

        {#if row.recruited}
          <div class="assign">
            {#if row.deployed}
              <span class="assign-field">🎯 em operação</span>
            {:else}
              {#each posts as p (p.def.id)}
                {#if p.unlocked}
                  {@const active = row.dept === p.def.id}
                  <button
                    class="assign-btn"
                    class:active
                    disabled={!active && postFull(p.def.id)}
                    title={p.def.desc}
                    onclick={() => assignHero(row.def.id, p.def.id)}
                  >
                    {p.def.emoji} {p.def.name}
                  </button>
                {/if}
              {/each}
            {/if}
          </div>
        {/if}

        {#if row.recruited && row.next}
          <div class="milestone-hint mono">
            faltam {row.next - row.level} níveis para ×2
          </div>
        {/if}
      </div>

      <button class="buy-btn" disabled={!row.affordable} onclick={() => trainHero(row.def.id, buyAmount)}>
        <span class="label">
          {row.recruited ? "Treinar" : "Alistar"}
          {#if row.buyCount > 1}<span class="qty">×{row.buyCount}</span>{/if}
        </span>
        <span class="mono cost">{formatNumber(row.cost, 0)}</span>
        <span class="mono gain">↗ +{formatRate(row.buyGain)}</span>
        {#if !row.affordable && row.wait}
          <span class="mono wait">em {row.wait}</span>
        {/if}
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

  .avatar {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 2px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    line-height: 1;
  }
  .avatar.dim {
    filter: grayscale(0.7);
    opacity: 0.6;
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
  .posts-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.7rem;
  }
  .post-tag {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-soft);
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 20px;
    padding: 0.2rem 0.65rem;
  }
  .post-tag strong {
    color: var(--sky-blue);
    margin-left: 0.15rem;
  }
  .post-tag.full strong {
    color: var(--power-gold);
  }

  .assign {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.35rem;
  }
  .assign-btn {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: transparent;
    border: 1px solid var(--rule);
    color: var(--text-faint);
    border-radius: 20px;
    padding: 0.1rem 0.5rem;
  }
  .assign-btn:hover:not(:disabled) {
    border-color: var(--sky-blue);
    color: var(--sky-blue);
  }
  .assign-btn.active {
    background: color-mix(in srgb, var(--sky-blue) 22%, transparent);
    border-color: var(--sky-blue);
    color: var(--sky-blue);
  }
  .assign-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .assign-field {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--gain-green);
    border: 1px solid var(--gain-green-ink);
    border-radius: 20px;
    padding: 0.1rem 0.5rem;
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
  .buy-btn .wait {
    font-size: 0.6rem;
    color: var(--text-faint);
  }
</style>
