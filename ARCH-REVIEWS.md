# Revisões de Arquitetura

## 2026-09-24 — Revisão pós Fase 0: Walking Skeleton

**1. Drift vs ADR:** alinhado. Dois ajustes menores, fora da stack:
- `@types/node` (dev) + `"node"` em `tsconfig.types`, exigidos por `playwright.config.ts`.
  Efeito colateral: código de `src/` também enxerga tipos Node sem erro. Encaminhamento:
  se virar problema, separar `tsconfig` de configs/testes do de `src/`.
- `PW_CHANNEL` no Playwright: permite usar o Chrome instalado quando o download do Chromium
  falha na rede local. A CI continua usando o Chromium do Playwright.

**2. Complexidade/acoplamento:** estável. `src/` tem 1 arquivo.

**3. Dependências novas:** `@types/node` (dev), justificada acima. Nenhuma dependência de runtime.

**4. Fitness functions:**
| FF | Resultado | Evidência |
|----|-----------|-----------|
| Regras puras sem `window`/`document`/`navigator` | n/a | módulos ainda não existem |
| `dependencies` vazio | pass | `package.json` sem `dependencies` |
| Sem canvas / `requestVideoFrameCallback` / reencode | pass | grep em `src/` vazio |
| Áudio com filtros de voz desligados | n/a | captura começa na Fase 1 |
| Testes antes de todo deploy | pass | `build` depende de `test` no workflow; run de `698986b` passou test → build → deploy |

**Encaminhamentos:** nenhum bloqueante.
**Veredito:** arquitetura saudável para avançar para a Fase 1.

## 2026-09-24 — Revisão pós Fase 1: Jornada crítica

**1. Drift vs ADR:** alinhado, com ajustes registrados no ADR/ROADMAP:
- Pareamento puro saiu de `source.ts` para `sourceRules.ts` (mantém a FF de pureza por arquivo).
- Seletores de vídeo/áudio antecipados da Fase 2 (sem eles a jornada falha com webcam conectada).
- Chrome libera áudio sem gesto durante captura; botão de desbloqueio virou rede de segurança.

**2. Complexidade/acoplamento:** estável. 7 módulos, `main.ts` é o único compositor; puros sem
imports de I/O.

**3. Dependências novas:** nenhuma.

**4. Fitness functions:**
| FF | Resultado | Evidência |
|----|-----------|-----------|
| Regras puras sem `window`/`document`/`navigator` | pass | grep vazio em `captureMode`, `volume`, `sourceRules` |
| `dependencies` vazio | pass | `package.json` |
| Sem canvas / `requestVideoFrameCallback` / reencode | pass | grep vazio em `src/` |
| Áudio com filtros de voz desligados | pass | `sourceRules.test.ts` |
| Testes antes de todo deploy | pass | run de `7b26bd4` test → build → deploy |

**Validação real (HITL):** usuário confirmou com a UGREEN CM630: "funcionou perfeito".

**Encaminhamentos:** Fase 3 antecipada antes da Fase 2 a pedido do usuário.
**Veredito:** arquitetura saudável para avançar.
