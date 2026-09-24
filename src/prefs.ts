// Preferências em localStorage, tolerante a falha (janela privada, dados bloqueados).

const PREFIX = 'capview.';

export function readPref(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Sem armazenamento a página funciona igual; só não lembra.
  }
}
