import type { BroomSweepGeometry } from './broom-sweep-frame';

const TEXT_SELECTOR = ':scope > [data-kk-broom-sweep-settled] > * > :not([data-kk-shell-bar-mark])';
const MARK_SELECTOR = ':scope > [data-kk-broom-sweep-settled] > * > [data-kk-shell-bar-mark]';

export const measureBroomSweep = (
  frame: HTMLElement,
  ghost: HTMLElement | null,
): BroomSweepGeometry => {
  const frameBox = frame.getBoundingClientRect();
  const textBox = frame.querySelector(TEXT_SELECTOR)?.getBoundingClientRect() ?? frameBox;
  const markBox = frame.querySelector(MARK_SELECTOR)?.getBoundingClientRect() ?? frameBox;
  const rowBox = frame.parentElement?.getBoundingClientRect() ?? frameBox;
  const ghostWidth = ghost?.getBoundingClientRect().width ?? 0;
  const textLeft = textBox.left - frameBox.left;
  const room = rowBox.right - textBox.left;

  return {
    textLeft,
    markCenter: markBox.left + markBox.width / 2 - frameBox.left,
    span: Math.max(textBox.width, Math.min(ghostWidth, room)),
    room,
  };
};
