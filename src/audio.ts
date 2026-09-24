// Grafo de áudio: stream da fonte → GainNode → saída. O <video> fica mudo; o som sai só por aqui.

export class AudioOutput {
  private readonly ctx = new AudioContext({ latencyHint: 'interactive' });
  private readonly gain = this.ctx.createGain();
  private input: MediaStreamAudioSourceNode | null = null;

  constructor() {
    this.gain.connect(this.ctx.destination);
  }

  /** O navegador só libera áudio depois de um gesto do usuário. */
  get needsGesture(): boolean {
    return this.ctx.state === 'suspended';
  }

  get gainValue(): number {
    return this.gain.gain.value;
  }

  onStateChange(listener: () => void): void {
    this.ctx.addEventListener('statechange', listener);
  }

  resume(): Promise<void> {
    return this.ctx.resume();
  }

  setStream(stream: MediaStream | null): void {
    this.input?.disconnect();
    this.input = stream ? this.ctx.createMediaStreamSource(stream) : null;
    this.input?.connect(this.gain);
  }

  setGain(value: number): void {
    this.gain.gain.value = value;
  }
}
