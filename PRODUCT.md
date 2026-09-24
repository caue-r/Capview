# capview — Product Brief

**Data:** 2026-09-24
**Versão:** 1.0
**Perfil de bootstrap:** Lean

---

## Preflight

| Item | Decisão |
|---|---|
| Tipo | Produto novo (repositório vazio) |
| Perfil | **Lean** — uma página, sem persistência de servidor, sem deploy com estado, reversível. Promover para Standard só se a complexidade provar necessidade. |
| Jornada crítica | Abrir a página → selecionar a placa → ver o jogo com som → ajustar volume → tela cheia |
| Contratos existentes | Nenhum (só `README.md` placeholder) |
| Contratos a criar | `PRODUCT.md` (este), `CONTEXT.md` (glossário, se o grill achar termos ambíguos), `ADR.md` (stack), tracker canônico, `AGENTS.md`, README operacional |
| Primeiro check executável | Playwright com dispositivo de mídia falso do Chromium (`--use-fake-device-for-media-stream`): vídeo reproduz e volume/mudo alteram o áudio |

---

## Problema

Jogar o console na tela do PC, via placa de captura **UGREEN CM630**, sem precisar abrir o OBS.
O OBS é pesado e genérico para o caso "só quero ver e ouvir o jogo". Por ser uso em jogo,
**latência baixa é o requisito nº 1**.

---

## Usuários

- [x] Só eu (inicialmente)
- [x] Outras pessoas (futuro) — distribuível **sem instalação** (a decidir no Stack Grill;
      candidato: site estático HTTPS; o vídeo nunca sai do computador do usuário)
- [ ] API pública / terceiros

---

## Menor uso com valor real (MVP)

1. Abrir a página e usar a placa de captura como fonte; se houver múltiplos dispositivos
   de vídeo/áudio, escolher — a escolha é lembrada.
2. Exibir vídeo + som sincronizados, com a menor latência possível (sem reencode).
3. Controle de volume e mudo.
4. Tela cheia com um clique.

Qualidade de vídeo: automática (melhor modo que a placa oferecer).

---

## Pós-MVP (v2)

- Configurar qualidade de vídeo (resolução / FPS) ao vivo.

---

## Fora do escopo (agora)

- Gravação
- Streaming / live
- Screenshot
- Overlays (contador de FPS, chat)
- Filtros de imagem (brilho, nitidez, scanlines)
- Múltiplas placas simultâneas
- Backend de captura (ffmpeg/WebRTC) — só entra se a placa não funcionar via `getUserMedia`

---

## Restrições conhecidas

- Navegador recomendado: **Firefox**. No Chrome/Edge a CM630 entrega MJPEG (comprimido) e a
  imagem fica pior; a página avisa. Ver `ADR.md` (2026-09-24).
- Premissa técnica a validar: a UGREEN CM630 é exposta pelo Windows como dispositivo UVC
  (webcam + microfone) e aparece no `navigator.mediaDevices.enumerateDevices()`.

---

## Critério de sucesso

- Consigo jogar uma partida inteira pela página, em tela cheia, sem perceber atraso
  incômodo entre controle e imagem, e sem dessincronia de áudio.
- Volume e mudo respondem na hora.
- Ao reabrir a página, ela volta a usar a placa sem eu escolher de novo.
