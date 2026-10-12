export const VIEWER_CONTROL_ATTRIBUTE = 'data-kk-viewer-control';

const CONTROL_SELECTOR = `input, textarea, select, video, [contenteditable], [${VIEWER_CONTROL_ATTRIBUTE}]`;

export const isOnViewerControl = (target: EventTarget): boolean =>
  target instanceof Element && target.closest(CONTROL_SELECTOR) !== null;
