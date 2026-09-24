// "Aviso rápido" (CONTEXT.md): mensagem breve sobre o vídeo, sem bloquear interação.

export const TOAST_MS = 1000;

export function createToast(el: HTMLElement): (message: string) => void {
  let timer: number | undefined;
  return (message) => {
    el.textContent = message;
    el.dataset.visible = '';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => delete el.dataset.visible, TOAST_MS);
  };
}
