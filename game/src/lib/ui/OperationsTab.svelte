<script lang="ts">
  import {
    game,
    activeBuff,
    opAvailable,
    availableHeroes,
    opPayout,
    opRoleBonusApplies,
    deployOperation,
    heroOutputRaw,
  } from "../game/state";
  import { OPERATIONS, OPERATIONS_BY_ID } from "../game/operations";
  import { HEROES_BY_ID, ROLE_ICON, FACTION_COLOR } from "../game/heroes";
  import { formatNumber, formatRate, formatDuration } from "../game/format";

  // Ticks so countdowns and cooldowns read down live.
  let now = $state(Date.now());
  $effect(() => {
    const t = setInterval(() => (now = Date.now()), 500);
    return () => clearInterval(t);
  });

  let planning = $state<string | null>(null);
  let picked = $state<string[]>([]);

  function openPlan(id: string) {
    planning = planning === id ? null : id;
    picked = [];
  }

  function togglePick(heroId: string, slots: number) {
    if (picked.includes(heroId)) picked = picked.filter((h) => h !== heroId);
    else if (picked.length < slots) picked = [...picked, heroId];
  }

  function send(id: string) {
    if (deployOperation(id, picked)) {
      planning = null;
      picked = [];
    }
  }

  let free = $derived(availableHeroes($game));
  let unlocked = $derived(OPERATIONS.filter((o) => $game.maxThreat >= o.minThreat));
  let locked = $derived(OPERATIONS.filter((o) => $game.maxThreat < o.minThreat));
</script>

<div class="wrap">
  {#if $game.activeOps.length > 0}
    <section>
      <h3 class="label section-title">Em campo</h3>
      <div class="grid">
        {#each $game.activeOps as op (op.defId)}
          {@const def = OPERATIONS_BY_ID[op.defId]}
          {@const total = op.endsAt - op.startedAt}
          {@const left = Math.max(0, op.endsAt - now)}
          {@const pct = total > 0 ? ((total - left) / total) * 100 : 100}
          <div class="op-card running">
            <div class="op-head">
              <span class="op-emoji">{def.emoji}</span>
              <span class="op-name">{def.name}</span>
              <span class="op-timer mono">{formatDuration(left)}</span>
            </div>
            <div class="squad">
              {#each op.heroIds as hid (hid)}
                <span class="squad-chip" style="border-color: {FACTION_COLOR[HEROES_BY_ID[hid].faction]}">
                  {HEROES_BY_ID[hid].emoji}
                  {HEROES_BY_ID[hid].name}
                </span>
              {/each}
            </div>
            <div class="op-bar"><div class="op-fill" style="width: {pct}%"></div></div>
            <div class="op-note mono">
              Retorno previsto: {formatNumber(opPayout($game, def, op.heroIds, $activeBuff))} de Verba
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <h3 class="label section-title">Operações disponíveis</h3>
    {#if unlocked.length === 0}
      <p class="empty-note">Nenhuma operação liberada ainda. Suba o nível de ameaça enfrentado pela agência.</p>
    {:else}
      <div class="grid">
        {#each unlocked as def (def.id)}
          {@const ready = opAvailable($game, def, now)}
          {@const cd = Math.max(0, ($game.opCooldowns[def.id] ?? 0) - now)}
          {@const isPlanning = planning === def.id}
          {@const enough = free.length >= def.slots}
          <div class="op-card" class:ready>
            <div class="op-head">
              <span class="op-emoji">{def.emoji}</span>
              <span class="op-name">{def.name}</span>
              <span class="op-slots mono">{def.slots} agentes</span>
            </div>
            <p class="op-brief">{def.brief}</p>
            <div class="op-meta mono">
              <span>⏱ {formatDuration(def.durationMs)}</span>
              {#if def.preferredRole}
                <span class="op-pref">
                  {ROLE_ICON[def.preferredRole] ?? "•"} equipe só de {def.preferredRole}: ×{def.roleBonus}
                </span>
              {/if}
            </div>

            {#if cd > 0}
              <div class="op-note mono">Em recomposição — disponível em {formatDuration(cd)}</div>
            {:else if isPlanning}
              <div class="picker">
                <div class="picker-head label">
                  Selecione {def.slots} — escolhidos: {picked.length}/{def.slots}
                </div>
                {#if free.length === 0}
                  <p class="empty-note">Nenhum herói livre. Aliste mais ou aguarde os que estão em campo.</p>
                {:else}
                  <div class="picker-list">
                    {#each free as h (h.id)}
                      {@const sel = picked.includes(h.id)}
                      <button
                        class="pick"
                        class:sel
                        style="border-color: {sel ? FACTION_COLOR[h.faction] : 'var(--rule)'}"
                        onclick={() => togglePick(h.id, def.slots)}
                      >
                        <span class="pick-emoji">{h.emoji}</span>
                        <span class="pick-body">
                          <span class="pick-name">{h.name}</span>
                          <span class="pick-rate mono">{formatRate(heroOutputRaw($game, h, $activeBuff))}</span>
                        </span>
                      </button>
                    {/each}
                  </div>
                {/if}
                {#if picked.length === def.slots}
                  <div class="preview mono">
                    Retorno estimado: <strong>{formatNumber(opPayout($game, def, picked, $activeBuff))}</strong>
                    {#if opRoleBonusApplies(def, picked)}<span class="bonus">bônus de especialidade ativo</span>{/if}
                  </div>
                {/if}
                <div class="picker-actions">
                  <button class="btn-ghost" onclick={() => (planning = null)}>Cancelar</button>
                  <button class="send" disabled={picked.length !== def.slots} onclick={() => send(def.id)}>
                    Destacar equipe
                  </button>
                </div>
              </div>
            {:else}
              <button class="plan" disabled={!enough} onclick={() => openPlan(def.id)}>
                {enough ? "Montar equipe" : `Precisa de ${def.slots} heróis livres`}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>

  {#if locked.length > 0}
    <section>
      <h3 class="label section-title">Ainda não autorizadas</h3>
      <div class="grid">
        {#each locked as def (def.id)}
          <div class="op-card locked">
            <div class="op-head">
              <span class="op-emoji">🔒</span>
              <span class="op-name">{def.name}</span>
            </div>
            <p class="op-brief">Liberada ao enfrentar a Ameaça nível {def.minThreat}.</p>
          </div>
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
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 0.7rem;
  }

  .op-card {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    background: var(--panel);
    border: 1px solid var(--rule);
    border-radius: 10px;
    padding: 0.75rem 0.85rem;
    height: 100%;
  }
  /* Whatever ends the card — the button, a cooldown note, or the squad
     picker — pins to the bottom so actions line up across the row. */
  .op-card > :last-child {
    margin-top: auto;
  }
  .op-card.ready {
    border-color: color-mix(in srgb, var(--sky-blue) 50%, var(--rule));
  }
  .op-card.running {
    border-color: var(--gain-green-ink);
  }
  .op-card.locked {
    opacity: 0.5;
  }

  .op-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .op-emoji {
    font-size: 1.2rem;
  }
  .op-name {
    flex: 1;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.92rem;
  }
  .op-slots,
  .op-timer {
    font-size: 0.72rem;
    color: var(--text-faint);
  }
  .op-timer {
    color: var(--gain-green);
  }
  .op-brief {
    font-size: 0.76rem;
    font-style: italic;
    color: var(--text-soft);
    margin: 0;
    /* Two lines' worth, so a short brief doesn't shrink its card next to a
       long one sitting in the same grid row. */
    min-height: 2.3em;
  }
  .op-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    font-size: 0.68rem;
    color: var(--text-faint);
    min-height: 1.4em;
  }
  .op-pref {
    color: var(--sky-blue);
  }
  .op-note {
    font-size: 0.68rem;
    color: var(--text-faint);
  }

  .squad {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .squad-chip {
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border: 1px solid;
    border-radius: 20px;
    padding: 0.1rem 0.5rem;
    color: var(--text-soft);
  }

  .op-bar {
    height: 7px;
    border-radius: 999px;
    background: var(--ink);
    border: 1px solid var(--rule);
    overflow: hidden;
  }
  .op-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gain-green-ink), var(--gain-green));
    transition: width 0.4s linear;
  }

  .plan,
  .send {
    background: color-mix(in srgb, var(--sky-blue) 20%, var(--panel-raised));
    border: 1px solid var(--sky-blue);
    color: var(--paper);
    border-radius: 8px;
    padding: 0.45rem 0.8rem;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.78rem;
  }
  .plan:disabled,
  .send:disabled {
    background: var(--panel-raised);
    border-color: var(--rule);
    color: var(--text-faint);
    cursor: not-allowed;
  }
  .plan:not(:disabled):hover,
  .send:not(:disabled):hover {
    background: color-mix(in srgb, var(--sky-blue) 32%, var(--panel-raised));
  }

  .picker {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    border-top: 1px dashed var(--rule);
    padding-top: 0.5rem;
  }
  .picker-head {
    font-size: 0.66rem;
    color: var(--text-faint);
  }
  .picker-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 220px;
    overflow-y: auto;
  }
  .pick {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.35rem 0.5rem;
    color: var(--paper);
    text-align: left;
  }
  .pick.sel {
    background: color-mix(in srgb, var(--sky-blue) 18%, var(--panel-raised));
  }
  .pick-emoji {
    font-size: 1.05rem;
  }
  .pick-body {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    min-width: 0;
  }
  .pick-name {
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.76rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pick-rate {
    font-size: 0.68rem;
    color: var(--gain-green);
    flex-shrink: 0;
  }

  .preview {
    font-size: 0.72rem;
    color: var(--text-soft);
  }
  .preview strong {
    color: var(--gain-green);
  }
  .bonus {
    display: block;
    color: var(--sky-blue);
    font-size: 0.66rem;
    margin-top: 0.1rem;
  }
  .picker-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>
