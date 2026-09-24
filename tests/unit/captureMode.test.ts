import { describe, expect, it } from 'vitest';
import {
  PREFERRED_MODE,
  captureModeCandidates,
  describeMode,
  fallbackVideoConstraints,
  videoConstraints,
} from '../../src/captureMode';

describe('captureModeCandidates', () => {
  const candidates = captureModeCandidates();

  it('começa por 1080p60', () => {
    expect(candidates[0]).toEqual({ width: 1920, height: 1080, frameRate: 60 });
  });

  it('não repete o modo preferido', () => {
    const preferred = candidates.filter(
      (m) => m.width === 1920 && m.height === 1080 && m.frameRate === 60,
    );
    expect(preferred).toHaveLength(1);
  });

  it('fallback: maior FPS primeiro e, dentro dele, maior resolução', () => {
    const fallbacks = candidates.slice(1);
    for (let i = 1; i < fallbacks.length; i++) {
      const prev = fallbacks[i - 1];
      const cur = fallbacks[i];
      const pixels = (m: typeof cur) => m.width * m.height;
      const ordered =
        prev.frameRate > cur.frameRate ||
        (prev.frameRate === cur.frameRate && pixels(prev) > pixels(cur));
      expect(ordered, `${JSON.stringify(prev)} antes de ${JSON.stringify(cur)}`).toBe(true);
    }
  });

  it('prefere 4K60 a 1080p30 quando 1080p60 não existe', () => {
    const order = candidates.map(describeMode);
    expect(order.indexOf('3840×2160 @ 60 fps')).toBeLessThan(order.indexOf('1920×1080 @ 30 fps'));
  });
});

describe('videoConstraints', () => {
  it('exige modo nativo, sem escala, com tolerância para 59,94 fps', () => {
    expect(videoConstraints('cam', PREFERRED_MODE)).toEqual({
      deviceId: { exact: 'cam' },
      width: { exact: 1920 },
      height: { exact: 1080 },
      frameRate: { min: 58, ideal: 60 },
      resizeMode: { exact: 'none' },
    });
  });

  it('fallback só usa ideal e mantém o dispositivo exato', () => {
    const c = fallbackVideoConstraints('cam');
    expect(c.deviceId).toEqual({ exact: 'cam' });
    expect(c.width).toEqual({ ideal: 1920 });
  });
});

describe('describeMode', () => {
  it('formata resolução e fps arredondado', () => {
    expect(describeMode({ width: 1920, height: 1080, frameRate: 59.94 })).toBe('1920×1080 @ 60 fps');
  });

  it('vazio sem resolução', () => {
    expect(describeMode({})).toBe('');
  });
});
