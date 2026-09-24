// Chromium no Windows pode receber MJPEG (comprimido) da placa mesmo quando ela oferece YUY2;
// o Firefox pede o formato sem compressão. Ver ADR, decisão de 2026-09-24. Módulo puro.

export function isChromium(userAgent: string): boolean {
  return /\b(Chrome|Chromium|Edg)\//.test(userAgent) && !/\bFirefox\//.test(userAgent);
}
