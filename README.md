# Ociosos

Idle game de sátira sobre super-heróis. Você dirige o **E.S.C.U.D.O.** — Escritório
Superior de Coordenação de Unidades Descomunais e Ocorrências — a agência que alista
heróis, banca o treinamento deles e os destaca para operações de campo.

O tom é sátira seca entregue com cara séria: os heróis são profissionais desgastados,
não palhaços, e as ameaças vão do assaltante aumentado ao conselho cósmico que emite
um parecer desfavorável sobre a Terra.

## Estado atual

Jogável de ponta a ponta, com o ciclo completo de um idle:

- **Loop central** — despacho manual → 12 heróis nomeados que produzem Verba passivamente.
  Um herói por vaga: subir de nível substitui o "comprar mais unidades" do gênero.
- **Marcos de nível** — 10/25/50/100/200/400/700/1000 dobram a produção do herói.
- **Sinergia de facção** — +15% por companheiro da mesma facção.
- **Operações de campo** — monte um esquadrão e destaque para uma missão. Herói em campo
  para de produzir passivamente, então cada envio é uma troca real de curto por longo prazo.
- **Reestruturação (prestígio)** — converte a Verba movimentada em Dossiês, por
  `(total / 1M) ^ 0,6`, limitado pelo teto do Arquivo Central.
- **Protocolos permanentes** — 9 melhorias que sobrevivem a toda reestruturação.
- **Melhorias por administração** — de despacho, globais e por herói.
- **Alertas Prioritários** — evento clicável com buff temporário (força-tarefa ×7,
  prontidão ×500, ou apreensão de recursos).
- **Condecorações** — 27 conquistas, cada uma +2% de produção permanente.
- **Conforto** — comprar ×1/×10/×100/Máx, impacto de cada compra no botão, tempo estimado
  até poder comprar, relatório com o detalhamento dos multiplicadores, exportar/importar
  save e progresso offline.

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
game/src/lib/game/    regras e estado (heroes, threats, operations, protocols, upgrades, achievements)
game/src/lib/ui/      uma aba por sistema
game/src/App.svelte   shell, barra lateral e navegação
```
