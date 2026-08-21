<script lang="ts">
  import { game, achievementMult } from "../game/state";
  import { ACHIEVEMENTS, ACHIEVEMENT_BONUS } from "../game/achievements";

  let unlocked = $derived(new Set($game.achievements));
  let count = $derived($game.achievements.length);
  let bonus = $derived(Math.round((achievementMult($game) - 1) * 100));
</script>

<div class="wrap">
  <div class="summary">
    <div class="summary-num display">{count}<span class="of">/{ACHIEVEMENTS.length}</span></div>
    <div class="summary-body">
      <div class="label summary-label">Condecorações</div>
      <p class="summary-copy">
        Cada condecoração dá +{Math.round(ACHIEVEMENT_BONUS * 100)}% de produção permanente. Bônus atual:
        <strong>+{bonus}%</strong>
      </p>
    </div>
  </div>

  <div class="grid">
    {#each ACHIEVEMENTS as a (a.id)}
      {@const got = unlocked.has(a.id)}
      <div class="tro-card" class:got>
        <div class="tro-emoji">{got ? a.emoji : "🔒"}</div>
        <div class="tro-body">
          <div class="tro-name">{a.name}</div>
          <div class="tro-desc">{a.desc}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  .summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
  }
  .summary-num {
    font-size: 2.4rem;
    color: var(--power-gold);
    line-height: 1;
  }
  .summary-num .of {
    font-size: 1.2rem;
    color: var(--text-faint);
  }
  .summary-label {
    font-size: 0.72rem;
    color: var(--text-faint);
  }
  .summary-copy {
    font-size: 0.82rem;
    color: var(--text-soft);
    margin: 0.2rem 0 0;
  }
  .summary-copy strong {
    color: var(--power-gold);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.55rem;
  }
  .tro-card {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.55rem 0.7rem;
    opacity: 0.45;
  }
  .tro-card.got {
    opacity: 1;
    border-color: color-mix(in srgb, var(--power-gold) 45%, var(--rule));
  }
  .tro-emoji {
    flex-shrink: 0;
    font-size: 1.3rem;
    width: 2.1rem;
    height: 2.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel-raised);
    border-radius: 50%;
  }
  .tro-body {
    min-width: 0;
  }
  .tro-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.82rem;
  }
  .tro-desc {
    font-size: 0.7rem;
    color: var(--text-faint);
    margin-top: 0.1rem;
  }
</style>
