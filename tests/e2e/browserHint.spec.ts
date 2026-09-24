import { expect, test } from '@playwright/test';

// Aviso de qualidade no Chrome/Edge (ADR 2026-09-24).

test('Chromium mostra o aviso uma vez; dispensar vale para as próximas visitas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'aviso só existe no Chromium');
  await page.goto('/');
  const hint = page.getByRole('note');
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('Firefox');

  await hint.getByRole('button', { name: 'Entendi' }).click();
  await expect(hint).toBeHidden();

  await page.reload();
  await expect(page.locator('#mode')).not.toBeEmpty();
  await expect(hint).toBeHidden();
});

test('Firefox não mostra o aviso', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'firefox', 'só Firefox');
  await page.goto('/');
  await expect(page.locator('#mode')).not.toBeEmpty();
  await expect(page.locator('#browser-hint')).toBeHidden();
});
