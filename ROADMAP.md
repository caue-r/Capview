# ROADMAP — capview

**Data:** 2026-09-24
**Total de fases:** 4 (0–3) + pós-MVP
**Tracker canônico:** este arquivo. Não criar `PROGRESS.md` nem tracker paralelo.

## Como ler

- **[AFK]** o agente completa e fecha sozinho. **[HITL]** exige validação do usuário.
- Critério de conclusão = comportamento observável.
- Toda fase termina com Revisão de Arquitetura registrada em `ARCH-REVIEWS.md`.

---

### Fase 0 — Walking Skeleton

**Objetivo:** esqueleto vazio publicado e com gate de teste funcionando.

**Critério de conclusão:**
> Eu abro `https://caue-r.github.io/Capview/` e vejo a página "capview"; um push na `main`
> com teste falhando não publica.

**Tarefas:**
1. [x] [AFK] Scaffold Vite + TypeScript (sem framework); `dependencies` vazio.
2. [x] [AFK] Vitest com 1 teste trivial; Playwright (Chromium, flags de mídia falsa) com 1 teste
   que abre a página.
3. [x] [AFK] GitHub Actions: `test` (unit + e2e) → `build` → `deploy` Pages; `base` do Vite
   relativo (`./`), independente do nome do repo.
4. [x] [AFK] `AGENTS.md` (+ `CLAUDE.md` apontando para ele) e README operacional.
5. [ ] [HITL] Ativar Pages: Settings → Pages → Source: GitHub Actions. [x] Repo renomeado
   para `Capview`.

**Dependência:** nenhuma
**Gate de arquitetura:** [ ]

---

### Fase 1 — Jornada crítica: ver e ouvir o jogo

**Objetivo:** jogar pela página com volume ajustável e tela cheia.

**Critério de conclusão:**
> Eu abro a página com a CM630 conectada, vejo e ouço o console em 1080p60 (ou fallback),
> ajusto volume 0–200% e mudo pela barra, entro em tela cheia e jogo sem atraso incômodo
> nem dessincronia.

**Tarefas:**
1. [AFK] `captureMode.ts` (1080p60 + fallback) com testes unitários.
2. [AFK] `source.ts`: pareamento por label (testado) + abertura do stream com áudio bruto.
3. [AFK] `audio.ts` + `volume.ts`: `<video>` mudo, áudio via `GainNode`; slider e mudo;
   gesto inicial "Clique para ativar o som" quando necessário.
4. [AFK] Botão de tela cheia.
5. [AFK] E2E: com dispositivo falso, vídeo reproduz e volume/mudo alteram o ganho.
6. [AFK] Criar `ARCHITECTURE.md`.
7. [HITL] Teste real com a UGREEN CM630: modo obtido, latência percebida, sincronia de áudio.

**Dependência:** Fase 0
**Gate de arquitetura:** [ ]

---

### Fase 2 — Fonte lembrada e placa ausente

**Critério de conclusão:**
> Eu escolho vídeo e áudio no seletor; ao reabrir, a página usa a mesma fonte, volume e mudo.
> Com a placa desplugada vejo "Placa não encontrada" e, ao plugar, a imagem volta sozinha.

**Tarefas:**
1. [AFK] `prefs.ts` (localStorage tolerante a falha) para fonte, volume, mudo.
2. [AFK] Seletores de vídeo e áudio independentes.
3. [AFK] Estado "Placa não encontrada" + reconexão via `devicechange`; nunca cair para outra câmera.
4. [AFK] E2E: persistência após reload; aviso quando `deviceId` salvo não existe.
5. [HITL] Teste real: desplugar e replugar a CM630.

**Dependência:** Fase 1
**Gate de arquitetura:** [ ]

---

### Fase 3 — Controles de jogo

**Critério de conclusão:**
> Em tela cheia os controles somem após ~2,5 s parado e voltam ao mexer o mouse;
> `↑`/`↓`/`M`/`F` funcionam e mostram um aviso rápido.

**Tarefas:**
1. [AFK] Auto-ocultar barra e cursor (não oculta com ponteiro sobre a barra/seletor aberto).
2. [AFK] Atalhos `↑`/`↓` (±5%), `M`, `F`.
3. [AFK] Toast (~1 s) para volume e mudo.
4. [AFK] E2E dos atalhos e do auto-ocultar.
5. [HITL] Sessão de jogo real completa (critério de sucesso do `PRODUCT.md`).

**Dependência:** Fase 2
**Gate de arquitetura:** [ ]

---

### Pós-MVP (não iniciar sem decisão)

- v2: qualidade de vídeo configurável (resolução/FPS ao vivo).
- PWA instalável.

---

## Marcos de validação

| Após a Fase | Pergunta |
|---|---|
| 1 | A abordagem só-navegador funciona bem com a CM630 (latência, áudio)? Se não → reavaliar backend ffmpeg. |
| 3 | Eu usaria isso no lugar do OBS todo dia? |
