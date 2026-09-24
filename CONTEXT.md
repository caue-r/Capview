# capview — Glossário do Domínio

Termos canônicos acordados no Domain Grill (2026-09-24). Código, testes e documentos usam
estes nomes e significados.

## Fonte (`Source`)

Par **(dispositivo de vídeo, dispositivo de áudio)** usado para exibir o jogo.

- Entrada: `deviceId` de vídeo + `deviceId` de áudio vindos de `enumerateDevices()`.
- Pareamento automático no primeiro uso: o dispositivo de áudio cujo `label` combina com o
  `label` do dispositivo de vídeo. Usuário pode trocar vídeo e áudio independentemente.
- A fonte escolhida é **persistida** e reutilizada na próxima abertura.
- **Fonte ausente:** se a fonte salva não está conectada, exibir aviso "Placa não
  encontrada" e aguardar; ao detectar o dispositivo (`devicechange`), conectar sozinho.
  **Nunca** cair automaticamente para outro dispositivo (ex.: webcam).
- Oposto: não é "qualquer câmera disponível".

## Modo de captura (`CaptureMode`)

Combinação resolução + FPS pedida ao dispositivo de vídeo.

- **Padrão:** 1920×1080 @ 60 FPS.
- **Fallback** (se a placa não suporta 1080p60): maior FPS disponível; dentro dele, maior
  resolução.
- No MVP é automático; configuração manual é v2.

## Áudio bruto (`rawAudio`)

Regra inviolável: o áudio da fonte é capturado com `echoCancellation`, `noiseSuppression`
e `autoGainControl` **desligados**. Esses filtros são pensados para voz e degradam áudio de jogo.

## Volume

- Faixa **0–200%**; 100% = áudio original da placa (ganho 1.0). Acima de 100% é amplificação
  e pode distorcer.
- **Mudo** é independente do nível: desmutar retorna ao nível anterior.
- Nível e mudo são **persistidos** entre sessões.

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| `↑` / `↓` | volume ±5% (limitado a 0–200%) |
| `M` | alterna mudo |
| `F` | alterna tela cheia |

## Controles (`Controls`)

Barra com volume, mudo, seletor de fonte e tela cheia, sobreposta ao vídeo.

- **Auto-ocultar:** aparece ao mover o mouse; some após ~2,5 s sem movimento
  (cursor também é ocultado).
- Não some enquanto o ponteiro está sobre a barra ou um seletor está aberto.

## Aviso rápido (`Toast`)

Mensagem breve sobreposta (~1 s) ao usar atalhos, ex.: "Volume 120%", "Mudo", "Som ativado".
Não bloqueia interação.

## Latência baixa

Definição operacional: o vídeo da fonte é exibido **sem reencode, sem canvas e sem
processamento por frame** (stream ligado direto ao elemento de vídeo). O áudio passa apenas
por um nó de ganho. Nenhum buffer adicional é introduzido pelo capview.
