import type { DetachedWindowAPI } from 'happy-dom';

declare global {
  interface Window {
    happyDOM?: DetachedWindowAPI;
  }
}

export const setViewportWidth = (width: number): void => {
  window.happyDOM?.setViewport({ width });
};

export const DESKTOP_VIEWPORT_WIDTH = 1024;
export const MOBILE_VIEWPORT_WIDTH = 390;
