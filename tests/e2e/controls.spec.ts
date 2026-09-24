import { expect, test } from '@playwright/test';

// Fase 3: auto-ocultar, atalhos e aviso rápido.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#mode')).not.toBeEmpty();
});

test('controles somem sem mexer o mouse e voltam ao mexer', async ({ page }) => {
  const app = page.locator('#app');
  const controls = page.locator('#controls');

  await page.mouse.move(200, 200);
  await expect(app).not.toHaveAttribute('data-idle');
  await expect(controls).toHaveCSS('opacity', '1');

  await expect(app).toHaveAttribute('data-idle', '', { timeout: 5000 });
  await expect(controls).toHaveCSS('opacity', '0');
  await expect(app).toHaveCSS('cursor', 'none');

  await page.mouse.move(220, 220);
  await expect(app).not.toHaveAttribute('data-idle');
  await expect(controls).toHaveCSS('opacity', '1');
});

test('controles não somem com o ponteiro sobre a barra', async ({ page }) => {
  await page.locator('#mute').hover();
  await page.waitForTimeout(3500);
  await expect(page.locator('#app')).not.toHaveAttribute('data-idle');
});

test('setas mudam o volume em 5% e mostram o aviso', async ({ page }) => {
  const value = page.locator('#volume-value');
  const toast = page.locator('#toast');

  await page.keyboard.press('ArrowUp');
  await expect(value).toHaveText('105%');
  await expect(toast).toHaveText('Volume 105%');
  await expect(toast).toHaveAttribute('data-visible', '');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(value).toHaveText('95%');
  // GainNode guarda float32: 0.95 vira 0.949999…
  await expect.poll(async () => Number(await value.getAttribute('data-gain'))).toBeCloseTo(0.95, 5);
  await expect(toast).toHaveText('Volume 95%');

  await expect(toast).not.toHaveAttribute('data-visible', { timeout: 3000 });
});

test('M alterna o mudo com aviso', async ({ page }) => {
  const mute = page.locator('#mute');
  const toast = page.locator('#toast');

  await page.keyboard.press('m');
  await expect(mute).toHaveAttribute('aria-pressed', 'true');
  await expect(toast).toHaveText('Mudo');

  await page.keyboard.press('M');
  await expect(mute).toHaveAttribute('aria-pressed', 'false');
  await expect(toast).toHaveText('Som ativado');
});

test('F alterna a tela cheia', async ({ page }) => {
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
});

test('atalhos não disparam com um seletor em foco', async ({ page }) => {
  await page.locator('#audio-device').focus();
  await page.keyboard.press('m');
  await expect(page.locator('#mute')).toHaveAttribute('aria-pressed', 'false');
});

test('seta com o slider em foco anda só um passo', async ({ page }) => {
  await page.locator('#volume').focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#volume-value')).toHaveText('105%');
});
