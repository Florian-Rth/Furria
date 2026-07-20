import type { DetachedWindowAPI } from 'happy-dom';

declare global {
  interface Window {
    happyDOM?: DetachedWindowAPI;
  }
}

// happy-dom evaluates CSS media queries against its viewport, so responsive
// chrome (mobile bar vs. desktop bar) is tested by setting the viewport width.
export const setViewportWidth = (width: number): void => {
  window.happyDOM?.setViewport({ width });
};

// happy-dom's default viewport width (desktop, where md+ styles apply).
export const DESKTOP_VIEWPORT_WIDTH = 1024;
export const MOBILE_VIEWPORT_WIDTH = 390;
