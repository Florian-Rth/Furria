const STANDALONE_QUERIES = [
  '(display-mode: standalone)',
  '(display-mode: fullscreen)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
].map((query) => window.matchMedia(query));

export const subscribeToStandalone = (onChange: () => void): (() => void) => {
  for (const query of STANDALONE_QUERIES) {
    query.addEventListener('change', onChange);
  }

  return () => {
    for (const query of STANDALONE_QUERIES) {
      query.removeEventListener('change', onChange);
    }
  };
};

export const readStandalone = (): boolean =>
  navigator.standalone === true || STANDALONE_QUERIES.some((query) => query.matches);
