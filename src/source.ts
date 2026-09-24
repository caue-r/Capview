// I/O da "Fonte": listar dispositivos e abrir os streams de vídeo e áudio.
import { captureModeCandidates, fallbackVideoConstraints, videoConstraints } from './captureMode';
import { type DeviceInfo, rawAudioConstraints } from './sourceRules';

export interface Devices {
  video: DeviceInfo[];
  audio: DeviceInfo[];
}

function toDevices(all: MediaDeviceInfo[]): Devices {
  const pick = (kind: MediaDeviceKind) =>
    all
      .filter((d) => d.kind === kind && d.deviceId)
      .map(({ deviceId, label, groupId }) => ({ deviceId, label, groupId }));
  return { video: pick('videoinput'), audio: pick('audioinput') };
}

/** Pede permissão uma vez para que os dispositivos venham com nome e id. */
async function requestPermission(): Promise<void> {
  let probe: MediaStream;
  try {
    probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (err) {
    // PC sem nenhuma entrada de áudio: ainda dá para mostrar o vídeo.
    if (!(err instanceof DOMException && err.name === 'NotFoundError')) throw err;
    probe = await navigator.mediaDevices.getUserMedia({ video: true });
  }
  probe.getTracks().forEach((t) => t.stop());
}

export async function listDevices(): Promise<Devices> {
  let all = await navigator.mediaDevices.enumerateDevices();
  const hasVideo = all.some((d) => d.kind === 'videoinput');
  const hasLabels = all.some((d) => d.kind === 'videoinput' && d.label);
  if (hasVideo && !hasLabels) {
    await requestPermission();
    all = await navigator.mediaDevices.enumerateDevices();
  }
  return toDevices(all);
}

/** Abre o vídeo no primeiro modo nativo aceito, na ordem da regra de modo de captura. */
export async function openVideo(deviceId: string): Promise<MediaStream> {
  for (const mode of captureModeCandidates()) {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: videoConstraints(deviceId, mode) });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'OverconstrainedError')) throw err;
    }
  }
  return navigator.mediaDevices.getUserMedia({ video: fallbackVideoConstraints(deviceId) });
}

export function openAudio(deviceId: string): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: rawAudioConstraints(deviceId) });
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop());
}

export function describeMediaError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  switch (name) {
    case 'NotAllowedError':
      return 'Permissão de câmera/microfone negada. Libere nas configurações do site e recarregue.';
    case 'NotReadableError':
      return 'A placa está em uso por outro programa (OBS?). Feche-o e recarregue.';
    case 'NotFoundError':
      return 'Nenhuma placa de captura encontrada.';
    default:
      return `Não foi possível abrir a placa: ${err instanceof Error ? err.message : String(err)}`;
  }
}
