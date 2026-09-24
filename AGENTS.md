# AGENTS.md — capview

Visualizador de placa de captura no navegador (UGREEN CM630): ver e ouvir o console com
latência mínima, volume 0–200% e tela cheia, sem OBS.

## Carregue conforme a tarefa

| Tarefa | Leia |
|---|---|
| Produto, escopo, prioridade | `PRODUCT.md` |
| Nomes e regras do domínio | `CONTEXT.md` |
| Stack, estrutura, fitness functions | `ADR.md` |
| O que fazer agora | `ROADMAP.md` (tracker canônico — único) |

## Stack

TypeScript puro + DOM (sem framework) · Vite · `getUserMedia` · Web Audio (`GainNode`) ·
`localStorage` · GitHub Pages via Actions · Vitest (regras puras) · Playwright (E2E, mídia falsa).

## Comandos

```
npm run dev         # localhost com reload
npm run typecheck
npm test            # Vitest
npm run test:e2e    # Playwright; sem Chromium baixado: PW_CHANNEL=chrome npm run test:e2e
npm run build       # dist/ estático
```

## Regras invioláveis

- `dependencies` do `package.json` fica vazio; só `devDependencies`.
- Regras puras (`captureMode`, `volume`, pareamento de fonte) não tocam `window`/`document`/`navigator`.
- Sem canvas, `requestVideoFrameCallback` ou reencode — o stream vai direto ao `<video>`.
- Áudio sempre com `echoCancellation`, `noiseSuppression`, `autoGainControl` = `false`.
- Fonte ausente nunca cai para outro dispositivo.
- Escopo negativo do `PRODUCT.md` vale: nada de gravação, streaming, overlays, filtros.

## Commits

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`...). Sem
`Co-Authored-By` nem menção ao agente como autor.

## Metodologia

SDD. Toda fase termina com Revisão de Arquitetura em `ARCH-REVIEWS.md`. Mudança estrutural →
atualizar `ADR.md` (e `ARCHITECTURE.md` a partir da Fase 1).
