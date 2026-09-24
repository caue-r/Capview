# ADR — capview

**Data:** 2026-09-24
**Baseado em:** `PRODUCT.md` v1.0 + `CONTEXT.md`
**Perfil:** Lean (este ADR acumula as decisões de stack e a estrutura planejada; não há SDD
separado. Estado atual do código: `ARCHITECTURE.md`.)

---

## Núcleo do Domínio

- [ ] Dados
- [x] Fluxo — stream de mídia da placa até a tela, sem processamento
- [ ] Regras de negócio (só 3 regras puras: modo de captura, volume, pareamento de fonte)
- [x] UI/Experiência — player em tela cheia com controles discretos

## Complexidade de Estado

- [x] **Simples** — volume, mudo, fonte, controles visíveis/ocultos

## Ciclo de Vida Esperado

- [x] **Produto de longo prazo** (pequeno) — uso diário e distribuição futura

## Consumidor

- [x] Solo (inicialmente)
- [x] Usuários externos (futuro, via link público, sem instalação)

---

## Decisão de Metodologia

**Escolha:** SDD

**Justificativa:** spec clara, saída previsível, solo. As 3 regras puras do glossário recebem
testes unitários; a jornada crítica recebe E2E com dispositivo de mídia falso.

**Postura de teste:** smoke E2E da jornada + unitários das regras puras. Na CI, **testes
falhando bloqueiam o deploy** no GitHub Pages.

---

## Stack Decidida

| Camada | Tecnologia | Motivo |
|---|---|---|
| Linguagem | TypeScript | Checagem de tipos como rede de segurança barata; usuário valida por comportamento, não por leitura de código |
| UI | TypeScript puro + DOM (sem framework) | ~7 elementos e estado mínimo; framework resolveria um problema inexistente |
| Build / dev server | Vite (devDependency) | Compila TS, serve `localhost` (contexto seguro exigido por `getUserMedia`), gera `dist/` estático |
| Captura | `navigator.mediaDevices.getUserMedia` | Placa UVC aparece como câmera+microfone; exibição direta, sem reencode |
| Áudio | Web Audio API (`GainNode`) | Permite 0–200% de ganho; `<video>` fica mudo e o áudio passa só pelo ganho |
| Persistência | `localStorage` (com try/catch) | 4 valores (vídeo, áudio, volume, mudo) |
| Distribuição | GitHub Pages via GitHub Actions, desde a Fase 0 | Link fixo HTTPS, custo zero, sem servidor; vídeo nunca sai do PC |
| Testes unitários | Vitest | Integrado ao Vite, zero config; regras puras em ms |
| Testes E2E | Playwright — Chromium (`--use-fake-device-for-media-stream`) e Firefox (`media.navigator.streams.fake`) | Jornada completa sem placa real, inclusive na CI |
| Navegador alvo | **Firefox** recomendado; Chrome/Edge funcionam com aviso | Chrome no Windows recebe MJPEG da placa (ver Decisões posteriores) |

---

## Decisões Descartadas

| Opção | Motivo da rejeição |
|---|---|
| JavaScript puro | Sem rede de segurança de tipos |
| JS + JSDoc + `tsc --noEmit` | Verboso e menos convencional que TS |
| React | Pesado demais para ~7 elementos |
| Preact / Svelte | Dependência sem ganho real no MVP |
| `tsc` sozinho | Não serve a página nem faz reload |
| esbuild direto | Dev server/reload manuais |
| Só local (`npm run dev`) | Atrito diário; exige Node para outras pessoas |
| PWA no MVP | Adiada para pós-MVP; não muda arquitetura |
| IndexedDB | Excessivo para 4 valores |
| Só Playwright | Diagnóstico pior e lento para regras puras |
| Backend local ffmpeg → WebRTC/HLS | Latência e complexidade maiores; só se a placa não funcionar via `getUserMedia` |

---

## Estrutura Planejada

```
index.html
src/
  main.ts          # composição: liga módulos ao DOM
  captureMode.ts   # PURO: escolhe CaptureMode (1080p60 → fallback maior FPS, maior resolução)
  volume.ts        # PURO: clamp 0–200%, passos de 5%, mudo independente do nível
  sourceRules.ts   # PURO: pareia áudio ao vídeo (groupId, depois label) + constraints de áudio bruto
  source.ts        # I/O: enumerar, abrir streams, aguardar devicechange
  audio.ts         # grafo Web Audio (MediaStreamSource → GainNode → destination)
  controls.ts      # barra de controles (DOM)
  shortcuts.ts     # PURO: tecla → ação
  autoHide.ts      # fade da barra e do cursor por inatividade
  toast.ts         # aviso rápido
  browser.ts       # PURO: detecta Chromium (aviso de qualidade)
  prefs.ts         # localStorage tolerante a falha
tests/
  unit/            # Vitest — regras puras
  e2e/             # Playwright — jornada crítica
```

Contratos-chave:
- `pickCaptureMode(capabilities) → { width, height, frameRate }`
- `pairAudio(videoLabel, audioDevices) → deviceId | null`
- `stepVolume(level, delta) → level` (0–200)
- Captura de áudio sempre com `{ echoCancellation: false, noiseSuppression: false, autoGainControl: false }`.

## Restrições da plataforma (conhecidas)

- **Autoplay:** tela cheia exige gesto. O `AudioContext` também, **exceto** no Chrome enquanto
  a página captura câmera/microfone (confirmado na Fase 1) — nesse caso o som toca sem clique.
  "Clique para ativar o som" fica como rede de segurança.
- **Permissão:** o primeiro acesso pede permissão de câmera/microfone; o navegador lembra
  por origem (`localhost` e o domínio do Pages são origens distintas).
- `label` dos dispositivos só vem preenchido após permissão concedida.

---

## Fitness Functions

| Fitness Function | Característica protegida | Como checar |
|---|---|---|
| `captureMode.ts`, `volume.ts`, `sourceRules.ts`, `shortcuts.ts` e `browser.ts` não acessam `window`, `document` nem `navigator` | regras puras testáveis | grep + testes unitários rodam em Node |
| Nenhuma dependência de runtime (`dependencies` vazio no `package.json`) | app sem peso extra | inspeção do `package.json` |
| Nenhum uso de `<canvas>`, `requestVideoFrameCallback` ou reencode em `src/` | latência baixa | grep |
| Captura de áudio sempre com os 3 filtros de voz desligados | áudio de jogo íntegro | teste unitário/grep das constraints |
| Testes passam antes de todo deploy | nada quebrado em produção | job de CI `test` precede `deploy` |

---

## Decisões posteriores

### 2026-09-24 — Firefox como navegador recomendado

**O que mudou:** o capview recomenda o Firefox; no Chrome/Edge exibe um aviso dispensável.
**Por quê:** com a UGREEN CM630 (1080p60, MJPEG e YUY2), o Chrome no Windows recebe **MJPEG**
(comprimido pela placa) — qualidade visivelmente pior. Evidência: no OBS, formato MJPEG ficou
igual ao Chrome e YUY2 ficou "muito bom"; o Firefox, com o mesmo site, ficou bom. A Media
Capture API não permite ao site escolher o formato de pixel.
**Alternativas descartadas:**
- Chrome com `--disable-features=MediaFoundationVideoCapture` — exige atalho especial por usuário (não testado).
- Programa local (ffmpeg/nativo) capturando YUY2 e entregando ao navegador — reencode, latência e
  complexidade; contraria o "só navegador".
- App nativo/Electron — Electron é Chromium (mesmo problema); nativo abandona o navegador.
**Impacto:** E2E roda em Chromium e Firefox na CI. Novo módulo puro `browser.ts` e `prefs.ts`
(base da persistência da Fase 2).
**Como reverter:** remover `#browser-hint` e o projeto `firefox` do Playwright.
