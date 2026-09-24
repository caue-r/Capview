import { describe, expect, it } from 'vitest';
import { type KeyInput, shortcutFor } from '../../src/shortcuts';

const key = (k: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key: k,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  repeat: false,
  ...extra,
});

describe('shortcutFor', () => {
  it('mapeia as teclas do glossário', () => {
    expect(shortcutFor(key('ArrowUp'))).toBe('volumeUp');
    expect(shortcutFor(key('ArrowDown'))).toBe('volumeDown');
    expect(shortcutFor(key('m'))).toBe('toggleMute');
    expect(shortcutFor(key('F'))).toBe('toggleFullscreen');
  });

  it('segurar as setas repete o passo de volume', () => {
    expect(shortcutFor(key('ArrowUp', { repeat: true }))).toBe('volumeUp');
  });

  it('segurar M/F não alterna repetidamente', () => {
    expect(shortcutFor(key('m', { repeat: true }))).toBeNull();
    expect(shortcutFor(key('f', { repeat: true }))).toBeNull();
  });

  it('ignora combinações com modificador e outras teclas', () => {
    expect(shortcutFor(key('f', { ctrlKey: true }))).toBeNull();
    expect(shortcutFor(key('m', { altKey: true }))).toBeNull();
    expect(shortcutFor(key('ArrowUp', { metaKey: true }))).toBeNull();
    expect(shortcutFor(key('x'))).toBeNull();
  });
});
