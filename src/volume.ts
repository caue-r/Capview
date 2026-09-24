// Regra "Volume" (CONTEXT.md): 0–200%, 100% = áudio original, passos de 5%. Módulo puro.

export const MIN_LEVEL = 0;
export const MAX_LEVEL = 200;
export const LEVEL_STEP = 5;

export interface Volume {
  /** Percentual inteiro, 0–200. */
  level: number;
  muted: boolean;
}

export const DEFAULT_VOLUME: Volume = { level: 100, muted: false };

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return DEFAULT_VOLUME.level;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));
}

/** Mudar o nível tira do mudo, como em players de vídeo comuns. */
export function setLevel(level: number): Volume {
  return { level: clampLevel(level), muted: false };
}

export function stepVolume(volume: Volume, direction: 1 | -1): Volume {
  return setLevel(volume.level + direction * LEVEL_STEP);
}

/** Mudo não altera o nível: desmutar volta ao nível anterior. */
export function toggleMute(volume: Volume): Volume {
  return { ...volume, muted: !volume.muted };
}

/** Ganho linear para o GainNode (1.0 = original). */
export function gainOf(volume: Volume): number {
  return volume.muted ? 0 : volume.level / 100;
}
