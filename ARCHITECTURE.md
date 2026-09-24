# ARCHITECTURE — capview

Snapshot do estado atual. Mudança estrutural atualiza este arquivo e o `ADR.md`.
**Atualizado:** 2026-09-24 (Fases 1 e 3)

## Fluxo

```
placa (UVC)
 ├─ vídeo ─ getUserMedia (modo nativo, sem escala) ─► <video muted> ─► tela
 └─ áudio ─ getUserMedia (filtros de voz off) ─► MediaStreamSource ─► GainNode (0–2.0) ─► saída
```

Vídeo e áudio são streams separados, abertos pelo `deviceId` de cada um. Nenhum frame passa
por JS, canvas ou encoder.

## Módulos (`src/`)

| Módulo | Tipo | Responsabilidade |
|---|---|---|
| `captureMode.ts` | puro | candidatos de modo (1080p60 → maior FPS → maior resolução), constraints de vídeo, texto do modo |
| `volume.ts` | puro | nível 0–200, passo 5, mudo, ganho |
| `sourceRules.ts` | puro | pareamento áudio↔vídeo (`groupId`, depois nome) e constraints de áudio bruto |
| `source.ts` | I/O | listar dispositivos (pede permissão se necessário), abrir streams, mensagens de erro |
| `audio.ts` | I/O | `AudioContext` + `GainNode` |
| `shortcuts.ts` | puro | tecla → ação (`↑`/`↓`/`M`/`F`; ignora modificadores e repetição de M/F) |
| `autoHide.ts` | DOM | `data-idle` em `#app` após 2,5 s sem mover o mouse; fade via CSS; mantém visível com ponteiro na barra ou seletor em foco |
| `toast.ts` | DOM | aviso rápido de 1 s em `#toast` |
| `controls.ts` | DOM | barra de controles; expõe `data-gain` e `data-audio` em `#volume-value` |
| `main.ts` | composição | estado da sessão, troca de dispositivos (descarta aberturas obsoletas), tela cheia, despacho de atalhos (ignorados com seletor em foco) |

Dependências: `main` → todos; `source` → `captureMode`, `sourceRules`; `controls` → tipos de
`sourceRules`/`volume`. Módulos puros não importam nada de I/O.

## Comportamentos da plataforma observados

- Chrome libera o `AudioContext` sem gesto enquanto a página captura câmera/microfone. O
  botão "Clique para ativar o som" fica como rede de segurança (outros navegadores/políticas).
- Abrir o vídeo tenta cada modo com `resizeMode: 'none'`; `OverconstrainedError` passa ao
  próximo. Sem nenhum aceito, usa constraints `ideal` (o navegador escolhe o mais próximo).

## Testes

- `tests/unit/` — regras puras (Vitest).
- `tests/e2e/player.spec.ts` — vídeo toca, som sem clique, volume/mudo alteram o ganho real,
  tela cheia.
- `tests/e2e/controls.spec.ts` — auto-ocultar, atalhos, aviso rápido. Chromium com mídia falsa e `--autoplay-policy=user-gesture-required`.

## Fitness functions

Ver `ADR.md`. Todas checadas pelo agente na revisão de fase; nenhuma automatizada em CI ainda
(além de "testes antes do deploy").
