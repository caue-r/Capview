// Barra de controles: liga os elementos do index.html a handlers e renderiza o estado.
import type { DeviceInfo } from './sourceRules';
import type { Volume } from './volume';

export interface ControlsHandlers {
  onLevel(level: number): void;
  onToggleMute(): void;
  onVideoDevice(deviceId: string): void;
  onAudioDevice(deviceId: string): void;
  onToggleFullscreen(): void;
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} ausente no index.html`);
  return el as T;
}

export class Controls {
  private readonly mute = byId<HTMLButtonElement>('mute');
  private readonly level = byId<HTMLInputElement>('volume');
  private readonly levelValue = byId<HTMLOutputElement>('volume-value');
  private readonly videoSelect = byId<HTMLSelectElement>('video-device');
  private readonly audioSelect = byId<HTMLSelectElement>('audio-device');
  private readonly mode = byId<HTMLSpanElement>('mode');
  private readonly fullscreen = byId<HTMLButtonElement>('fullscreen');

  constructor(handlers: ControlsHandlers) {
    this.level.addEventListener('input', () => handlers.onLevel(Number(this.level.value)));
    this.mute.addEventListener('click', () => handlers.onToggleMute());
    this.videoSelect.addEventListener('change', () => handlers.onVideoDevice(this.videoSelect.value));
    this.audioSelect.addEventListener('change', () => handlers.onAudioDevice(this.audioSelect.value));
    this.fullscreen.addEventListener('click', () => handlers.onToggleFullscreen());
  }

  /** `gain` é o valor real do GainNode, exposto em data-gain para os testes E2E. */
  renderVolume(volume: Volume, gain: number): void {
    this.level.value = String(volume.level);
    this.levelValue.value = `${volume.level}%`;
    this.levelValue.dataset.gain = String(gain);
    this.mute.setAttribute('aria-pressed', String(volume.muted));
    this.mute.textContent = volume.muted ? '🔇' : '🔊';
  }

  /** Estado do áudio em data-audio (off | suspended | running), para diagnóstico e E2E. */
  renderAudioState(state: 'off' | 'suspended' | 'running'): void {
    this.levelValue.dataset.audio = state;
  }

  renderDevices(video: DeviceInfo[], audio: DeviceInfo[], videoId: string, audioId: string): void {
    fillSelect(this.videoSelect, video, videoId);
    fillSelect(this.audioSelect, audio, audioId, 'Sem áudio');
  }

  renderMode(text: string): void {
    this.mode.textContent = text;
  }

  renderFullscreen(active: boolean): void {
    this.fullscreen.textContent = active ? 'Sair da tela cheia' : 'Tela cheia';
  }
}

function fillSelect(select: HTMLSelectElement, devices: DeviceInfo[], selected: string, emptyLabel?: string): void {
  const options = devices.map((d, i) => new Option(d.label || `Dispositivo ${i + 1}`, d.deviceId));
  if (emptyLabel !== undefined) options.unshift(new Option(emptyLabel, ''));
  select.replaceChildren(...options);
  select.value = selected;
}
