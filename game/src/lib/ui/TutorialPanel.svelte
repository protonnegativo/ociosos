<script lang="ts">
  import {
    game,
    tutorialActive,
    currentTutorialStep,
    tutorialContext,
    tutorialAnchorOf,
    tutorialStepReady,
    claimTutorialStep,
    skipTutorial,
  } from "../game/state";
  import { TUTORIAL_TOTAL, rewardText } from "../game/tutorial";

  // Handed the step's target tab so the host decides how navigation works.
  let { onOpenTab }: { onOpenTab: (tab: string) => void } = $props();

  let step = $derived(currentTutorialStep($game));
  let ready = $derived(tutorialStepReady($game));
  let progress = $derived.by(() => {
    if (!step?.progress) return null;
    return step.progress(tutorialContext($game), tutorialAnchorOf($game));
  });
  let pct = $derived(progress && progress.target > 0 ? Math.min(100, (progress.current / progress.target) * 100) : 0);
</script>

{#if tutorialActive($game) && step}
  <section class="tutorial" class:ready>
    <div class="tut-top">
      <span class="tut-label label">
        {ready ? "Etapa concluída" : "Treinamento"} · etapa {$game.tutorialStep + 1} de {TUTORIAL_TOTAL}
      </span>
      <button class="tut-skip" onclick={skipTutorial}>pular</button>
    </div>
    {#if ready}
      <div class="tut-done">
        <p class="tut-lesson">{step.lesson}</p>
        <button class="tut-claim" onclick={claimTutorialStep}>
          ✓ Entendi — receber {rewardText(step.reward)}
        </button>
      </div>
    {:else}
      <button class="tut-task" onclick={() => onOpenTab(step.tab)}>
        <span class="tut-title">{step.title(tutorialAnchorOf($game))}</span>
        <span class="tut-reward mono">recompensa: {rewardText(step.reward)}</span>
      </button>
      <div class="tut-bar">
        <div class="tut-fill" style="width: {pct}%"></div>
      </div>
    {/if}
    <div class="tut-steps">
      {#each Array(TUTORIAL_TOTAL) as _, i (i)}
        <span class="tut-pip" class:done={i < $game.tutorialStep} class:now={i === $game.tutorialStep}></span>
      {/each}
      {#if progress && !ready}
        <span class="tut-count mono">{progress.current}/{progress.target}</span>
      {/if}
    </div>
  </section>
{/if}

<style>
  .tutorial.ready {
    background: color-mix(in srgb, var(--gain-green) 14%, var(--panel));
    border-color: var(--gain-green-ink);
  }
  .tutorial {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    background: color-mix(in srgb, var(--power-gold) 12%, var(--panel));
    border: 1px solid color-mix(in srgb, var(--power-gold) 50%, transparent);
    border-radius: 10px;
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.8rem;
  }
  .tut-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tut-label {
    font-size: 0.64rem;
    color: var(--power-gold);
  }
  .tut-skip {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 0.66rem;
    text-decoration: underline;
    padding: 0;
  }
  .tut-skip:hover {
    color: var(--text-soft);
  }
  .tut-task {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    color: var(--paper);
  }
  .tut-title {
    font-size: 0.92rem;
  }
  .tut-task:hover .tut-title {
    text-decoration: underline;
  }
  .tut-reward {
    font-size: 0.68rem;
    color: var(--gain-green);
  }
  .tut-bar {
    height: 5px;
    border-radius: 999px;
    background: var(--ink);
    overflow: hidden;
  }
  .tut-fill {
    height: 100%;
    background: var(--power-gold);
    transition: width 0.4s ease-out;
  }
  .tut-done {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tut-lesson {
    font-size: 0.86rem;
    line-height: 1.45;
    color: var(--paper);
    margin: 0;
    max-width: 68ch;
  }
  .tut-claim {
    align-self: flex-start;
    background: var(--gain-green-ink);
    border: 1px solid var(--gain-green);
    color: #06170a;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.84rem;
    animation: claim-in 0.2s ease-out;
  }
  .tut-claim:hover {
    background: var(--gain-green);
  }
  @keyframes claim-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tut-steps {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .tut-pip {
    width: 100%;
    max-width: 1.4rem;
    height: 3px;
    border-radius: 999px;
    background: var(--rule);
  }
  .tut-pip.done {
    background: var(--gain-green);
  }
  .tut-pip.now {
    background: var(--power-gold);
  }
  .tut-count {
    margin-left: auto;
    font-size: 0.66rem;
    color: var(--text-faint);
  }
</style>
