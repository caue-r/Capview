import { describe, expect, it } from 'vitest';
import { type DeviceInfo, pairAudio, rawAudioConstraints } from '../../src/sourceRules';

const dev = (deviceId: string, label: string, groupId = ''): DeviceInfo => ({ deviceId, label, groupId });

describe('pairAudio', () => {
  it('prefere o mesmo groupId', () => {
    const video = dev('v', 'Qualquer (1234:abcd)', 'g1');
    const audio = [dev('a1', 'Microfone (Realtek Audio)', 'g0'), dev('a2', 'Sem nome parecido', 'g1')];
    expect(pairAudio(video, audio)).toBe('a2');
  });

  it('pareia pelo nome ignorando id USB e palavras genéricas', () => {
    const video = dev('v', 'UGREEN 25854 (0c45:6366)');
    const audio = [
      dev('a1', 'Microfone (Realtek(R) Audio)'),
      dev('a2', 'Digital Audio Interface (UGREEN 25854)'),
    ];
    expect(pairAudio(video, audio)).toBe('a2');
  });

  it('placa genérica "USB Video" pareia com "USB Digital Audio"', () => {
    const video = dev('v', 'USB Video (534d:2109)');
    const audio = [
      dev('a1', 'Microfone (Realtek(R) Audio)'),
      dev('a2', 'Digital Audio Interface (USB Digital Audio)'),
    ];
    expect(pairAudio(video, audio)).toBe('a2');
  });

  it('ignora as entradas virtuais default/communications', () => {
    const video = dev('v', 'UGREEN 25854');
    const audio = [dev('default', 'Padrão - Microfone (UGREEN 25854)'), dev('real', 'Microfone (UGREEN 25854)')];
    expect(pairAudio(video, audio)).toBe('real');
  });

  it('sem correspondência retorna null em vez de chutar', () => {
    const video = dev('v', 'Integrated Camera (04f2:b6dd)');
    const audio = [dev('a1', 'Microphone Array (Realtek)')];
    expect(pairAudio(video, audio)).toBeNull();
  });
});

describe('rawAudioConstraints', () => {
  it('desliga os filtros de voz', () => {
    expect(rawAudioConstraints('a')).toMatchObject({
      deviceId: { exact: 'a' },
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    });
  });
});
