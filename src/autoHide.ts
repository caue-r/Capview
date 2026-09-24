// "Controles" auto-ocultáveis (CONTEXT.md): somem (com o cursor) após um tempo sem mover o
// mouse; não somem com o ponteiro sobre a barra nem com um seletor em foco.

export const IDLE_MS = 2500;

export function autoHide(app: HTMLElement, bar: HTMLElement): void {
  let timer: number | undefined;

  const mustStayVisible = () =>
    bar.matches(':hover') || (document.activeElement instanceof HTMLSelectElement && bar.contains(document.activeElement));

  const scheduleHide = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (mustStayVisible()) scheduleHide();
      else app.dataset.idle = '';
    }, IDLE_MS);
  };

  const wake = () => {
    delete app.dataset.idle;
    scheduleHide();
  };

  app.addEventListener('pointermove', wake);
  app.addEventListener('pointerdown', wake);
  scheduleHide();
}
