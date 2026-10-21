const STANDALONE_QUERIES = [
  '(display-mode: standalone)',
  '(display-mode: fullscreen)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
];

const standaloneMediaOf = (): MediaQueryList[] =>
  STANDALONE_QUERIES.map((query) => window.matchMedia(query));

export const subscribeToStandalone = (onChange: () => void): (() => void) => {
  const media = standaloneMediaOf();
  for (const query of media) {
    query.addEventListener('change', onChange);
  }

  return () => {
    for (const query of media) {
      query.removeEventListener('change', onChange);
    }
  };
};

export const readStandalone = (): boolean =>
  navigator.standalone === true || standaloneMediaOf().some((query) => query.matches);
