import { describe, expect, it } from 'vitest';
import { DEFAULT_VOLUME, clampLevel, gainOf, setLevel, stepVolume, toggleMute } from '../../src/volume';

describe('volume', () => {
  it('padrão é 100% sem mudo', () => {
    expect(DEFAULT_VOLUME).toEqual({ level: 100, muted: false });
    expect(gainOf(DEFAULT_VOLUME)).toBe(1);
  });

  it('limita a 0–200%', () => {
    expect(clampLevel(-10)).toBe(0);
    expect(clampLevel(250)).toBe(200);
    expect(clampLevel(Number.NaN)).toBe(100);
  });

  it('passos de 5% respeitam os limites', () => {
    expect(stepVolume({ level: 100, muted: false }, 1).level).toBe(105);
    expect(stepVolume({ level: 200, muted: false }, 1).level).toBe(200);
    expect(stepVolume({ level: 3, muted: false }, -1).level).toBe(0);
  });

  it('200% vira ganho 2.0', () => {
    expect(gainOf({ level: 200, muted: false })).toBe(2);
  });

  it('mudo zera o ganho e desmutar volta ao nível anterior', () => {
    const muted = toggleMute({ level: 150, muted: false });
    expect(gainOf(muted)).toBe(0);
    expect(gainOf(toggleMute(muted))).toBe(1.5);
  });

  it('mudar o nível tira do mudo', () => {
    expect(setLevel(120)).toEqual({ level: 120, muted: false });
  });
});
