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
