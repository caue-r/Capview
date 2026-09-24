import { type Project, defineConfig, devices } from '@playwright/test';

const PORT = 4173;

// Firefox é o navegador recomendado (ADR 2026-09-24). Roda na CI; localmente só com
// PW_FIREFOX=1, pois exige o Firefox do Playwright baixado.
const firefox: Project = {
  name: 'firefox',
  use: {
    ...devices['Desktop Firefox'],
    launchOptions: {
      firefoxUserPrefs: {
        'media.navigator.streams.fake': true,
        'media.navigator.permission.disabled': true,
      },
    },
  },
};

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // PW_CHANNEL=chrome usa o Chrome instalado quando o Chromium do Playwright não pode ser baixado.
        channel: process.env.PW_CHANNEL || undefined,
        // Câmera e microfone simulados: a jornada roda sem a placa real, inclusive na CI.
        launchOptions: {
          args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
            // Força o caminho real do usuário: áudio só após um gesto.
            '--autoplay-policy=user-gesture-required',
          ],
        },
        permissions: ['camera', 'microphone'],
      },
    },
    ...(process.env.CI || process.env.PW_FIREFOX ? [firefox] : []),
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
