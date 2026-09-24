# capview

Veja e ouça o console pela placa de captura direto no navegador — sem OBS, com latência
mínima, volume de 0 a 200% e tela cheia. O vídeo é processado só no seu computador; o site
apenas entrega a página.

**Usar:** https://caue-r.github.io/Capview/

A placa precisa aparecer no Windows como câmera/microfone (UVC). Teste rápido: se ela aparece
em https://webcamtests.com, funciona no capview.

## Desenvolvimento

Requer Node 22+.

```
npm install
npm run dev          # http://localhost:5173
npm test             # testes unitários (Vitest)
npm run test:e2e     # E2E (Playwright, câmera/microfone simulados)
npm run build        # gera dist/
```

Se `npx playwright install chromium` não conseguir baixar o navegador, use o Chrome instalado:
`PW_CHANNEL=chrome npm run test:e2e`.

Cada push na `main` roda os testes no GitHub Actions e, se passarem, publica no GitHub Pages.

## Documentação

- [PRODUCT.md](PRODUCT.md) — problema, MVP e escopo
- [CONTEXT.md](CONTEXT.md) — glossário do domínio
- [ADR.md](ADR.md) — stack e decisões
- [ROADMAP.md](ROADMAP.md) — fases e progresso
