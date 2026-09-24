import { expect, test } from '@playwright/test';

test('página abre e mostra capview', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('capview');
  await expect(page.getByRole('heading', { name: 'capview' })).toBeVisible();
});

test('dispositivo de mídia falso está disponível', async ({ page }) => {
  await page.goto('/');
  const kinds = await page.evaluate(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const tracks = stream.getTracks().map((t) => t.kind);
    stream.getTracks().forEach((t) => t.stop());
    return tracks.sort();
  });
  expect(kinds).toEqual(['audio', 'video']);
});
