// Regra "Modo de captura" (CONTEXT.md): 1080p60; se a placa não suporta,
// maior FPS e, dentro dele, maior resolução. Módulo puro.

export interface CaptureMode {
  width: number;
  height: number;
  frameRate: number;
}

export const PREFERRED_MODE: CaptureMode = { width: 1920, height: 1080, frameRate: 60 };

// Ordenados do maior para o menor.
const FRAME_RATES = [60, 50, 30, 25];
const RESOLUTIONS: ReadonlyArray<readonly [number, number]> = [
  [3840, 2160],
  [2560, 1440],
  [1920, 1080],
  [1280, 720],
  [640, 480],
];

// Placas de captura costumam entregar 59,94 fps em vez de 60.
const FRAME_RATE_TOLERANCE = 2;

/** Modos a tentar, em ordem: o preferido, depois maior FPS e maior resolução. */
export function captureModeCandidates(): CaptureMode[] {
  const fallbacks: CaptureMode[] = [];
  for (const frameRate of FRAME_RATES) {
    for (const [width, height] of RESOLUTIONS) {
      const isPreferred =
        width === PREFERRED_MODE.width &&
        height === PREFERRED_MODE.height &&
        frameRate === PREFERRED_MODE.frameRate;
      if (!isPreferred) fallbacks.push({ width, height, frameRate });
    }
  }
  return [PREFERRED_MODE, ...fallbacks];
}

/**
 * Constraints que só aceitam um modo nativo do dispositivo. `resizeMode: 'none'` impede o
 * navegador de escalar/decimar para "satisfazer" o pedido, o que esconderia a falta de suporte.
 */
export function videoConstraints(deviceId: string, mode: CaptureMode): MediaTrackConstraints {
  return {
    deviceId: { exact: deviceId },
    width: { exact: mode.width },
    height: { exact: mode.height },
    frameRate: { min: mode.frameRate - FRAME_RATE_TOLERANCE, ideal: mode.frameRate },
    resizeMode: { exact: 'none' },
  } as MediaTrackConstraints;
}

/** Último recurso quando nenhum candidato é aceito: deixa o navegador escolher o mais próximo. */
export function fallbackVideoConstraints(deviceId: string): MediaTrackConstraints {
  return {
    deviceId: { exact: deviceId },
    width: { ideal: PREFERRED_MODE.width },
    height: { ideal: PREFERRED_MODE.height },
    frameRate: { ideal: PREFERRED_MODE.frameRate },
  };
}

export function describeMode(mode: Partial<CaptureMode>): string {
  if (!mode.width || !mode.height) return '';
  const fps = mode.frameRate ? ` @ ${Math.round(mode.frameRate)} fps` : '';
  return `${mode.width}×${mode.height}${fps}`;
}
