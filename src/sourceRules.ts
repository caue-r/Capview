// Regras da "Fonte" e do "Áudio bruto" (CONTEXT.md). Módulo puro.

export interface DeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

// Entradas virtuais do Chrome que duplicam um dispositivo real.
const VIRTUAL_DEVICE_IDS = new Set(['default', 'communications']);

// Palavras que aparecem em qualquer dispositivo e não ajudam a identificar a placa.
const GENERIC_WORDS = new Set([
  'microphone',
  'microfone',
  'mic',
  'audio',
  'video',
  'digital',
  'interface',
  'input',
  'device',
]);

function labelTokens(label: string): Set<string> {
  const withoutUsbId = label.toLowerCase().replace(/\([0-9a-f]{4}:[0-9a-f]{4}\)/g, ' ');
  return new Set(
    withoutUsbId.split(/[^a-z0-9]+/).filter((token) => token && !GENERIC_WORDS.has(token)),
  );
}

/**
 * Escolhe o áudio da mesma placa que o vídeo: primeiro pelo `groupId` (mesmo dispositivo
 * físico), depois pelo nome. Retorna `null` se nada combina — nunca chuta um microfone qualquer.
 */
export function pairAudio(video: DeviceInfo, audioDevices: DeviceInfo[]): string | null {
  const candidates = audioDevices.filter((d) => !VIRTUAL_DEVICE_IDS.has(d.deviceId));

  if (video.groupId) {
    const sameGroup = candidates.find((d) => d.groupId === video.groupId);
    if (sameGroup) return sameGroup.deviceId;
  }

  const videoTokens = labelTokens(video.label);
  let best: { deviceId: string; score: number } | null = null;
  for (const audio of candidates) {
    let score = 0;
    for (const token of labelTokens(audio.label)) if (videoTokens.has(token)) score++;
    if (score > 0 && (!best || score > best.score)) best = { deviceId: audio.deviceId, score };
  }
  return best?.deviceId ?? null;
}

/** Áudio de jogo: os filtros pensados para voz ficam sempre desligados. */
export function rawAudioConstraints(deviceId: string): MediaTrackConstraints {
  return {
    deviceId: { exact: deviceId },
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: { ideal: 2 },
  };
}
