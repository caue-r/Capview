// Composição da página: liga fonte, áudio e controles.
import { AudioOutput } from './audio';
import { autoHide } from './autoHide';
import { isChromium } from './browser';
import { describeMode } from './captureMode';
import { Controls } from './controls';
import { readPref, writePref } from './prefs';
import { shortcutFor } from './shortcuts';
import { type Devices, describeMediaError, listDevices, openAudio, openVideo, stopStream } from './source';
import { pairAudio } from './sourceRules';
import { createToast } from './toast';
import { DEFAULT_VOLUME, type Volume, gainOf, setLevel, stepVolume, toggleMute } from './volume';

const screen = document.getElementById('screen') as HTMLVideoElement;
const status = document.getElementById('status') as HTMLParagraphElement;
const unlock = document.getElementById('unlock') as HTMLButtonElement;
const showToast = createToast(document.getElementById('toast') as HTMLElement);

const audio = new AudioOutput();
let volume: Volume = DEFAULT_VOLUME;
let devices: Devices = { video: [], audio: [] };
let videoId = '';
let audioId = '';
let videoStream: MediaStream | null = null;
let audioStream: MediaStream | null = null;
// Descarta aberturas antigas quando o usuário troca de dispositivo antes da anterior terminar.
let videoRequest = 0;
let audioRequest = 0;

const controls = new Controls({
  onLevel: (level) => applyVolume(setLevel(level)),
  onToggleMute: () => applyVolume(toggleMute(volume)),
  onVideoDevice: (id) => void selectVideo(id),
  onAudioDevice: (id) => void selectAudio(id),
  onToggleFullscreen: () => void toggleFullscreen(),
});

function showStatus(message: string | null): void {
  status.textContent = message ?? '';
  status.hidden = message === null;
}

function applyVolume(next: Volume): void {
  volume = next;
  audio.setGain(gainOf(volume));
  controls.renderVolume(volume, audio.gainValue);
}

function renderAudio(): void {
  unlock.hidden = !(audioId && audio.needsGesture);
  controls.renderAudioState(!audioStream ? 'off' : audio.needsGesture ? 'suspended' : 'running');
}

async function selectVideo(id: string): Promise<void> {
  const request = ++videoRequest;
  videoId = id;
  stopStream(videoStream);
  videoStream = null;
  showStatus('Conectando à placa…');
  try {
    const stream = await openVideo(id);
    if (request !== videoRequest) return stopStream(stream);
    videoStream = stream;
    screen.srcObject = stream;
    await screen.play().catch(() => undefined);
    controls.renderMode(describeMode(stream.getVideoTracks()[0]?.getSettings() ?? {}));
    showStatus(null);
  } catch (err) {
    if (request === videoRequest) showStatus(describeMediaError(err));
  }
}

async function selectAudio(id: string): Promise<void> {
  const request = ++audioRequest;
  audioId = id;
  stopStream(audioStream);
  audioStream = null;
  audio.setStream(null);
  renderAudio();
  if (!id) return;
  try {
    const stream = await openAudio(id);
    if (request !== audioRequest) return stopStream(stream);
    audioStream = stream;
    audio.setStream(stream);
    renderAudio();
  } catch (err) {
    if (request === audioRequest) showStatus(describeMediaError(err));
  }
}

function onShortcut(event: KeyboardEvent): void {
  // Com um seletor em foco, as teclas navegam nas opções dele.
  if (event.target instanceof HTMLSelectElement) return;
  const action = shortcutFor(event);
  if (!action) return;
  // Evita que as setas também movam o slider em foco ou rolem a página.
  event.preventDefault();
  switch (action) {
    case 'volumeUp':
    case 'volumeDown':
      applyVolume(stepVolume(volume, action === 'volumeUp' ? 1 : -1));
      showToast(`Volume ${volume.level}%`);
      break;
    case 'toggleMute':
      applyVolume(toggleMute(volume));
      showToast(volume.muted ? 'Mudo' : 'Som ativado');
      break;
    case 'toggleFullscreen':
      void toggleFullscreen();
      break;
  }
}

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}

async function start(): Promise<void> {
  showStatus('Conectando à placa…');
  try {
    devices = await listDevices();
  } catch (err) {
    showStatus(describeMediaError(err));
    return;
  }
  const video = devices.video[0];
  if (!video) {
    showStatus('Nenhuma placa de captura encontrada.');
    return;
  }
  videoId = video.deviceId;
  audioId = pairAudio(video, devices.audio) ?? '';
  controls.renderDevices(devices.video, devices.audio, videoId, audioId);
  await Promise.all([selectVideo(videoId), selectAudio(audioId)]);
}

// Qualquer gesto libera o áudio; o botão só deixa isso explícito.
const resumeAudio = () => {
  if (audio.needsGesture) void audio.resume();
};
document.addEventListener('pointerdown', resumeAudio);
// Firefox só libera o AudioContext em alguns tipos de evento; click é aceito em todos.
document.addEventListener('click', resumeAudio);
document.addEventListener('keydown', resumeAudio);
document.addEventListener('keydown', onShortcut);
autoHide(document.getElementById('app') as HTMLElement, document.getElementById('controls') as HTMLElement);
audio.onStateChange(renderAudio);
document.addEventListener('fullscreenchange', () => controls.renderFullscreen(!!document.fullscreenElement));

const BROWSER_HINT_PREF = 'browserHintDismissed';
const browserHint = document.getElementById('browser-hint') as HTMLElement;
browserHint.hidden = !isChromium(navigator.userAgent) || readPref(BROWSER_HINT_PREF) === '1';
document.getElementById('browser-hint-close')?.addEventListener('click', () => {
  browserHint.hidden = true;
  writePref(BROWSER_HINT_PREF, '1');
});

screen.muted = true;
applyVolume(volume);
void start();
