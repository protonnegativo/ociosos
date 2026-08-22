# Ociosos

Idle game de sátira sobre super-heróis. Você dirige o **E.S.C.U.D.O.** — Escritório
Superior de Coordenação de Unidades Descomunais e Ocorrências — a agência que alista
heróis, decide onde cada um trabalha e os destaca para operações de campo.

O tom é sátira seca entregue com cara séria: os heróis são profissionais desgastados,
não palhaços, e as ameaças vão do assaltante aumentado ao conselho cósmico que emite
um parecer desfavorável sobre a Terra.

## O loop central

Não existe clique nem renda automática solta. O jogo inteiro é decidir **onde cada
herói alistado está trabalhando agora**:

- **Patrulha** — posto padrão, vagas ilimitadas, rende Verba.
- **Investigação** — poucas vagas, rende Intel. Sem Intel, nenhuma operação sai do papel.
- **Logística** — poucas vagas (abre mais tarde), rende Equipamento. Squad equipada
  rende 1,5× numa operação.

Doze heróis disputando três ou quatro postos bons é a decisão real do jogo — puxada
do Melvor Idle (uma skill ativa por vez, tudo o resto é escolha de alocação) em vez do
clicker tradicional.

**Operações de campo**: monte um esquadrão com os heróis livres e destaque para uma
missão. Quem está em campo não produz nada em nenhum departamento enquanto a missão
roda — o retorno é bem maior que patrulha no mesmo tempo, mas a troca é real.

## Estado atual

Jogável de ponta a ponta, com o ciclo completo de um idle:

- **12 heróis** nomeados, com nível, marcos (10/25/50/100/200/400/700/1000 dobram a
  produção) e sinergia de facção (+15% por companheiro da mesma facção).
- **3 departamentos** com vagas limitadas — a peça central do jogo — mais **7
  operações de campo** que consomem Intel e opcionalmente Equipamento.
- **Tutorial guiado em 10 etapas**, no estilo Melvor: cada etapa exige um check
  explícito (com uma lição curta sobre por que a mecânica funciona) antes de liberar
  a recompensa, e mostra quantas faltam. Ensina só o suficiente pra se virar — o resto
  o jogador descobre jogando.
- **Reestruturação (prestígio)** — converte a Verba movimentada em Dossiês, por
  `(total / 1M) ^ 0,6`, limitado pelo teto do Arquivo Central.
- **10 Protocolos permanentes** — sobrevivem a toda reestruturação, incluindo
  multiplicadores para produção geral, vagas de departamento e as taxas de
  Intel/Equipamento.
- **33 melhorias por administração** — globais e por herói, somem ao reestruturar.
- **Alertas Prioritários** — evento clicável, ancorado num canto fixo da tela (nunca
  cobre um botão), com buff temporário ou apreensão de recursos.
- **25 condecorações**, cada uma +2% de produção permanente.
- **Conforto** — comprar ×1/×10/×100/Máx, impacto de cada compra no botão, tempo
  estimado até poder comprar, arrastar-e-soltar heróis entre departamentos (com
  clique como alternativa sempre disponível), relatório com o detalhamento dos
  multiplicadores, exportar/importar save, progresso offline, painel de debug com
  reset rápido.

## Rodando

```bash
cd game
npm install
npm run dev
```

Outros comandos:

```bash
npm run check   # svelte-check + tsc
npm run build   # build de produção
```

## Pilha

TypeScript + Svelte 5 + Vite, com [break_infinity.js](https://github.com/Patashu/break_infinity.js)
para os números que passam do limite de precisão do `Number`. A escolha é deliberada: um idle
é quase só interface e números reagindo a um relógio, sem física nem render 3D, então
tecnologia web empacotada depois como app nativo (Tauri) chega à Steam sem precisar de engine.

## Documento de design

`ociosos-game-design.html` — a pesquisa de gênero, a matemática da progressão, a economia,
o elenco e o plano de produção. Abra direto no navegador.

## Estrutura

```
game/src/lib/game/    regras e estado (heroes, threats, departments, operations,
                       protocols, upgrades, achievements, tutorial, objectives, clock)
game/src/lib/ui/      uma aba por sistema, mais os painéis extraídos do shell
                       (TutorialPanel, DebugPanel, DepartmentBoard)
game/src/App.svelte   shell, barra lateral e navegação
```
