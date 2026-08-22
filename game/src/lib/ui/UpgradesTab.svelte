<script lang="ts">
  import { game, production, buyUpgrade, availableUpgrades, upgradeContext } from "../game/state";
  import { UPGRADES, UPGRADES_BY_ID } from "../game/upgrades";
  import { formatNumber, timeToAfford } from "../game/format";

  const KIND_LABEL: Record<string, string> = {
    global: "Agência",
    hero: "Herói",
  };

  let ctx = $derived(upgradeContext($game));
  let available = $derived(availableUpgrades($game));
  let owned = $derived($game.upgrades.map((id) => UPGRADES_BY_ID[id]).filter(Boolean));
  let locked = $derived(UPGRADES.filter((u) => !$game.upgrades.includes(u.id) && !u.unlocked(ctx)));
</script>

<div class="wrap">
  <section>
    <h3 class="label section-title">Disponíveis</h3>
    {#if available.length === 0}
      <p class="empty-note">Nada novo por enquanto. Treine o efetivo e enfrente ameaças maiores para liberar novas melhorias.</p>
    {:else}
      <div class="grid">
        {#each available as u (u.id)}
          {@const affordable = $game.verba.gte(u.cost)}
          {@const wait = timeToAfford(u.cost, $game.verba, $production)}
          <div class="up-card" class:affordable>
            <div class="up-emoji">{u.emoji}</div>
            <div class="up-body">
              <div class="up-name">{u.name}</div>
              <div class="up-desc">{u.desc}</div>
              <span class="chip chip-muted">{KIND_LABEL[u.kind]}</span>
            </div>
            <button class="up-buy" disabled={!affordable} onclick={() => buyUpgrade(u.id)}>
              <span class="mono cost">{formatNumber(u.cost, 0)}</span>
              {#if !affordable && wait}<span class="mono wait">em {wait}</span>{/if}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  {#if locked.length > 0}
    <section>
      <h3 class="label section-title">A destravar</h3>
      <div class="grid">
        {#each locked.slice(0, 8) as u (u.id)}
          <div class="up-card locked">
            <div class="up-emoji">🔒</div>
            <div class="up-body">
              <div class="up-name">{u.name}</div>
              <div class="up-desc">Requisito: {u.reqText}</div>
            </div>
          </div>
        {/each}
      </div>
      {#if locked.length > 8}
        <p class="more-note mono">+{locked.length - 8} melhorias ainda escondidas</p>
      {/if}
    </section>
  {/if}

  {#if owned.length > 0}
    <section>
      <h3 class="label section-title">Vigentes nesta administração ({owned.length})</h3>
      <div class="owned-list">
        {#each owned as u (u.id)}
          <span class="owned-pill" title={u.desc}>{u.emoji} {u.name}</span>
        {/each}
      </div>
    </section>
  {/if}
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
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 0.6rem;
  }

  .up-card {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
  }
  .up-card.affordable {
    border-color: color-mix(in srgb, var(--power-gold) 55%, var(--rule));
  }
  .up-card.locked {
    opacity: 0.5;
  }

  .up-emoji {
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
  .up-body {
    flex: 1;
    min-width: 0;
  }
  .up-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
  }
  .up-desc {
    font-size: 0.72rem;
    color: var(--text-soft);
    margin: 0.1rem 0 0.25rem;
  }

  .up-buy {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    min-width: 80px;
  }
  .up-buy:not(:disabled) {
    background: color-mix(in srgb, var(--power-gold) 22%, var(--panel-raised));
    border-color: var(--power-gold);
  }
  .up-buy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .up-buy .cost {
    font-size: 0.78rem;
    color: var(--power-gold);
  }
  .up-buy:disabled .cost {
    color: var(--text-faint);
  }
  .up-buy .wait {
    font-size: 0.6rem;
    color: var(--text-faint);
  }

  .owned-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .owned-pill {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: color-mix(in srgb, var(--gain-green) 14%, var(--panel));
    border: 1px solid var(--gain-green-ink);
    color: var(--gain-green);
    border-radius: 20px;
    padding: 0.15rem 0.6rem;
  }
  .more-note {
    font-size: 0.7rem;
    color: var(--text-faint);
    margin: 0.5rem 0 0;
  }
</style>
