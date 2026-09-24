import { type Page, expect, test } from '@playwright/test';

// Jornada crítica da Fase 1 com câmera/microfone falsos (Chromium e Firefox).

async function videoIsPlaying(page: Page): Promise<boolean> {
  return page.locator('#screen').evaluate(
    (v: HTMLVideoElement) => !v.paused && v.readyState >= 2 && v.videoWidth > 0,
  );
}

/** O dispositivo falso não compartilha nome com o microfone falso; escolhe o áudio manualmente. */
async function ensureAudioSelected(page: Page): Promise<void> {
  const select = page.locator('#audio-device');
  if ((await select.inputValue()) === '') {
    const firstReal = await select.locator('option:not([value=""])').first().getAttribute('value');
    await select.selectOption(firstReal!);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('mostra o vídeo da fonte com o modo de captura', async ({ page }) => {
  await expect.poll(() => videoIsPlaying(page)).toBe(true);
  // Nem todo navegador informa o fps nas settings do dispositivo falso.
  await expect(page.locator('#mode')).toHaveText(/^\d+×\d+( @ \d+ fps)?$/);
  await expect(page.locator('#status')).toBeHidden();
  await expect(page.locator('#screen')).toHaveJSProperty('muted', true);
});

// Com captura ativa o Chrome libera áudio sem gesto, mesmo com a política de autoplay estrita.
test('som toca sem pedir clique no Chromium enquanto a placa está capturando', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'exceção de autoplay específica do Chromium');
  await ensureAudioSelected(page);
  await expect.poll(() => videoIsPlaying(page)).toBe(true);
  await expect(page.getByRole('button', { name: 'Clique para ativar o som' })).toBeHidden();
  await expect(page.locator('#volume-value')).toHaveAttribute('data-audio', 'running');
});

test('som fica ativo, no máximo depois do botão de ativar', async ({ page }) => {
  await ensureAudioSelected(page);
  await expect.poll(() => videoIsPlaying(page)).toBe(true);
  const audioState = page.locator('#volume-value');
  await expect(audioState).not.toHaveAttribute('data-audio', 'off');
  const unlock = page.getByRole('button', { name: 'Clique para ativar o som' });
  if (await unlock.isVisible()) await unlock.click();
  // data-audio primeiro: se falhar, a mensagem mostra o estado real do AudioContext.
  await expect(audioState).toHaveAttribute('data-audio', 'running');
  await expect(unlock).toBeHidden();
});

test('volume de 0 a 200% e mudo alteram o ganho', async ({ page }) => {
  const value = page.locator('#volume-value');
  const mute = page.getByRole('button', { name: 'Mudo' });

  await expect(value).toHaveText('100%');
  await expect(value).toHaveAttribute('data-gain', '1');

  await page.getByRole('slider', { name: 'Volume' }).fill('150');
  await expect(value).toHaveText('150%');
  await expect(value).toHaveAttribute('data-gain', '1.5');

  await mute.click();
  await expect(mute).toHaveAttribute('aria-pressed', 'true');
  await expect(value).toHaveAttribute('data-gain', '0');

  await mute.click();
  await expect(mute).toHaveAttribute('aria-pressed', 'false');
  await expect(value).toHaveAttribute('data-gain', '1.5');

  await page.getByRole('slider', { name: 'Volume' }).fill('200');
  await expect(value).toHaveAttribute('data-gain', '2');
});

test('botão de tela cheia entra e sai', async ({ page }) => {
  const button = page.locator('#fullscreen');
  await button.click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await expect(button).toHaveText('Sair da tela cheia');
  await button.click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await expect(button).toHaveText('Tela cheia');
});
