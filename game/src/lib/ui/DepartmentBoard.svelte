<script lang="ts">
  import {
    game,
    activeBuff,
    assignHero,
    departmentSlots,
    heroesInDepartment,
    departmentUnlocked,
    availableHeroes,
    heroOutputRaw,
    intelPerSecond,
    equipPerSecond,
    totalRecruited,
  } from "../game/state";
  import { DEPARTMENTS, DEFAULT_DEPARTMENT, intelRate, equipRate, type DepartmentDef } from "../game/departments";
  import { HEROES_BY_ID } from "../game/heroes";
  import { formatRate } from "../game/format";

  // Which empty slot is currently picking a hero.
  let picking = $state<string | null>(null);

  let free = $derived(availableHeroes($game));

  let columns = $derived(
    DEPARTMENTS.map((def) => {
      const members = heroesInDepartment($game, def.id);
      const slots = departmentSlots($game, def);
      return {
        def,
        members,
        slots,
        unlocked: departmentUnlocked($game, def),
        empty: def.unlimited ? 0 : Math.max(0, slots - members.length),
      };
    }),
  );

  function output(def: DepartmentDef, heroId: string): string {
    const hero = HEROES_BY_ID[heroId];
    const level = $game.levels[heroId] ?? 0;
    if (def.yields === "verba") return formatRate(heroOutputRaw($game, hero, $activeBuff));
    if (def.yields === "intel") return `${intelRate(level).toFixed(2)}/s`;
    return `${equipRate(level).toFixed(2)}/s`;
  }

  function totalOutput(def: DepartmentDef, members: string[]): string {
    if (def.yields === "intel") return `${intelPerSecond($game).toFixed(2)} Intel/s`;
    if (def.yields === "equipamento") return `${equipPerSecond($game).toFixed(2)} Equip/s`;
    let sum = members.reduce(
      (acc, id) => acc.plus(heroOutputRaw($game, HEROES_BY_ID[id], $activeBuff)),
      $game.verba.times(0),
    );
    return `${formatRate(sum)} Verba`;
  }

  function lockReason(def: DepartmentDef): string {
    const missing = def.minHeroes - totalRecruited($game);
    if (missing > 0) return `Aliste ${missing} herói${missing > 1 ? "s" : ""} para abrir`;
    return `Abre na Ameaça ${def.minThreat}`;
  }

  function pick(deptId: string, heroId: string) {
    assignHero(heroId, deptId);
    picking = null;
  }

  function release(heroId: string) {
    assignHero(heroId, DEFAULT_DEPARTMENT);
  }

  // Drag is an addition, never the only path: it is undiscoverable on its own
  // and does not exist on touch, so every action here also works by clicking.
  let dragging = $state<string | null>(null);
  let hoverDept = $state<string | null>(null);

  function canDrop(deptId: string, heroId: string | null): boolean {
    if (!heroId) return false;
    const col = columns.find((c) => c.def.id === deptId);
    if (!col || !col.unlocked) return false;
    if (col.members.includes(heroId)) return false;
    return col.def.unlimited || col.members.length < col.slots;
  }

  function startDrag(e: DragEvent, heroId: string) {
    dragging = heroId;
    e.dataTransfer?.setData("text/plain", heroId);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  }

  function overDept(e: DragEvent, deptId: string) {
    if (!canDrop(deptId, dragging)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    hoverDept = deptId;
  }

  function dropOn(e: DragEvent, deptId: string) {
    e.preventDefault();
    const heroId = dragging ?? e.dataTransfer?.getData("text/plain") ?? null;
    if (heroId && canDrop(deptId, heroId)) assignHero(heroId, deptId);
    dragging = null;
    hoverDept = null;
  }
</script>

<div class="board">
  {#each columns as col (col.def.id)}
    <section
      class="dept"
      class:locked={!col.unlocked}
      class:drop-ok={dragging && hoverDept === col.def.id}
      class:drop-no={dragging && !canDrop(col.def.id, dragging) && !col.members.includes(dragging)}
      ondragover={(e) => overDept(e, col.def.id)}
      ondragleave={() => (hoverDept = hoverDept === col.def.id ? null : hoverDept)}
      ondrop={(e) => dropOn(e, col.def.id)}
      role="group"
      style="--accent: {col.def.yields === 'verba' ? 'var(--power-gold)' : col.def.yields === 'intel' ? 'var(--sky-blue)' : 'var(--gain-green)'}">
      <header class="dept-head">
        <span class="dept-emoji">{col.def.emoji}</span>
        <span class="dept-name">{col.def.name}</span>
        <span class="dept-count mono">
          {#if !col.unlocked}🔒{:else if col.def.unlimited}{col.members.length}{:else}{col.members.length}/{col.slots}{/if}
        </span>
      </header>

      {#if !col.unlocked}
        <p class="dept-lock">{lockReason(col.def)}</p>
      {:else}
        <p class="dept-desc">{col.def.desc}</p>
        <div class="dept-total mono">▲ {totalOutput(col.def, col.members)}</div>
        {#if col.members.length > 0}
          <p class="dept-tip">
            arraste para mover{#if !col.def.unlimited} · ✕ devolve à Patrulha{/if}
          </p>
        {/if}

        <ul class="slots">
          {#each col.members as id (id)}
            <li
              class="slot filled"
              class:being-dragged={dragging === id}
              draggable="true"
              ondragstart={(e) => startDrag(e, id)}
              ondragend={() => {
                dragging = null;
                hoverDept = null;
              }}
            >
              <span class="grip" aria-hidden="true">⠿</span>
              <span class="slot-emoji">{HEROES_BY_ID[id].emoji}</span>
              <span class="slot-name">{HEROES_BY_ID[id].name}</span>
              <span class="slot-rate mono">{output(col.def, id)}</span>
              {#if !col.def.unlimited}
                <button
                  class="slot-release"
                  title="Devolver {HEROES_BY_ID[id].name} à Patrulha"
                  aria-label="Devolver {HEROES_BY_ID[id].name} à Patrulha"
                  onclick={() => release(id)}
                >
                  ✕
                </button>
              {/if}
            </li>
          {/each}

          {#each Array(col.empty) as _, i (i)}
            <li class="slot empty">
              {#if picking === col.def.id && i === 0}
                {#if free.length === 0}
                  <span class="slot-hint">Ninguém livre — todos já estão em posto ou em campo</span>
                {:else}
                  <div class="pick-list">
                    {#each free as h (h.id)}
                      <button class="pick-opt" onclick={() => pick(col.def.id, h.id)}>
                        {h.emoji}
                        {h.name}
                      </button>
                    {/each}
                  </div>
                {/if}
                <button class="slot-cancel" onclick={() => (picking = null)}>cancelar</button>
              {:else}
                <button class="slot-add" onclick={() => (picking = col.def.id)}>+ designar herói</button>
              {/if}
            </li>
          {/each}

          {#if col.def.unlimited}
            <li class="slot empty">
              <span class="slot-hint">Todo herói sem posto patrulha por padrão</span>
            </li>
          {/if}
        </ul>
      {/if}
    </section>
  {/each}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0.7rem;
    margin-bottom: 1.2rem;
  }

  .dept {
    background: var(--panel);
    border: 1px solid var(--rule);
    border-top: 3px solid var(--accent);
    border-radius: 10px;
    padding: 0.7rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .dept.locked {
    opacity: 0.5;
  }
  .dept.drop-ok {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--panel));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
  }
  .dept.drop-no {
    opacity: 0.45;
  }

  .dept-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .dept-emoji {
    font-size: 1.1rem;
  }
  .dept-name {
    flex: 1;
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.9rem;
  }
  .dept-count {
    font-size: 0.78rem;
    color: var(--accent);
    font-weight: 600;
  }
  .dept-desc {
    font-size: 0.68rem;
    color: var(--text-faint);
    margin: 0;
  }
  .dept-lock {
    font-size: 0.72rem;
    font-style: italic;
    color: var(--text-faint);
    margin: 0.2rem 0;
  }
  .dept-tip {
    font-size: 0.62rem;
    font-style: italic;
    color: var(--text-faint);
    margin: 0;
  }
  .dept-total {
    font-size: 0.74rem;
    color: var(--accent);
    font-weight: 600;
  }

  .slots {
    list-style: none;
    margin: 0.2rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .slot {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 7px;
    padding: 0.3rem 0.45rem;
    font-size: 0.74rem;
  }
  .slot.filled {
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    cursor: grab;
  }
  .slot.filled:active {
    cursor: grabbing;
  }
  .slot.being-dragged {
    opacity: 0.4;
  }
  .grip {
    flex-shrink: 0;
    color: var(--text-faint);
    font-size: 0.8rem;
    line-height: 1;
  }
  .slot.empty {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
    border: 1px dashed color-mix(in srgb, var(--accent) 55%, var(--rule));
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    padding: 0.35rem;
  }
  .slot-emoji {
    font-size: 0.95rem;
  }
  .slot-name {
    flex: 1;
    font-family: "Barlow Condensed", sans-serif;
    text-transform: uppercase;
    font-size: 0.74rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .slot-rate {
    font-size: 0.66rem;
    color: var(--gain-green);
  }
  .slot-release {
    flex-shrink: 0;
    background: transparent;
    border: 1px solid var(--rule);
    color: var(--text-faint);
    border-radius: 5px;
    width: 1.3rem;
    height: 1.3rem;
    line-height: 1;
    font-size: 0.7rem;
    padding: 0;
  }
  .slot-release:hover {
    border-color: var(--hero-red);
    color: var(--hero-red);
    background: color-mix(in srgb, var(--hero-red) 15%, transparent);
  }
  .slot-hint {
    font-size: 0.64rem;
    font-style: italic;
    color: var(--text-faint);
    text-align: center;
  }

  .slot-add {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--accent);
    font-family: "Barlow Condensed", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.74rem;
    padding: 0.15rem;
  }
  .slot-add:hover {
    text-decoration: underline;
  }
  .pick-list {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-height: 190px;
    overflow-y: auto;
  }
  .pick-opt {
    background: var(--panel-raised);
    border: 1px solid var(--rule);
    border-radius: 6px;
    color: var(--paper);
    text-align: left;
    padding: 0.28rem 0.45rem;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.76rem;
    text-transform: uppercase;
  }
  .pick-opt:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .slot-cancel {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 0.64rem;
    text-decoration: underline;
  }
</style>
