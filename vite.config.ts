/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Relativo: funciona em localhost e em https://<user>.github.io/<repo>/ sem depender do nome do repo.
  base: './',
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
