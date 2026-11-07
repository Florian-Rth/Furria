const CAPTURE = true;

export const swallowSequenceClick = (): void => {
  const release = (): void => {
    window.removeEventListener('click', swallow, CAPTURE);
    window.removeEventListener('pointerdown', release, CAPTURE);
    window.removeEventListener('keydown', release, CAPTURE);
  };
  const swallow = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
    release();
  };
  window.addEventListener('click', swallow, CAPTURE);
  window.addEventListener('pointerdown', release, CAPTURE);
  window.addEventListener('keydown', release, CAPTURE);
};
