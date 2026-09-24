// Atalhos de teclado (CONTEXT.md): ↑/↓ volume ±5%, M mudo, F tela cheia. Módulo puro.

export type ShortcutAction = 'volumeUp' | 'volumeDown' | 'toggleMute' | 'toggleFullscreen';

export interface KeyInput {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

export function shortcutFor(input: KeyInput): ShortcutAction | null {
  // Combinações com modificador pertencem ao navegador/sistema (Ctrl+F, Alt+M...).
  if (input.ctrlKey || input.altKey || input.metaKey) return null;
  switch (input.key) {
    case 'ArrowUp':
      return 'volumeUp';
    case 'ArrowDown':
      return 'volumeDown';
  }
  // Segurar M/F não deve ficar alternando.
  if (input.repeat) return null;
  switch (input.key.toLowerCase()) {
    case 'm':
      return 'toggleMute';
    case 'f':
      return 'toggleFullscreen';
  }
  return null;
}
