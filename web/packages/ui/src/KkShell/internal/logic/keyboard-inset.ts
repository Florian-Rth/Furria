export interface KkViewportMetrics {
  innerHeight: number;
  viewportHeight: number;
  offsetTop: number;
}

const KEYBOARD_MIN_INSET = 120;

export const isKeyboardOpen = ({
  innerHeight,
  viewportHeight,
  offsetTop,
}: KkViewportMetrics): boolean => innerHeight - viewportHeight - offsetTop >= KEYBOARD_MIN_INSET;
