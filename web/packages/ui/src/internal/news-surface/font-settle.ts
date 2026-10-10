export const onFontsSettled = (measure: () => void): (() => void) => {
  let live = true;
  void document.fonts.ready.then(() => {
    if (live) {
      measure();
    }
  });
  document.fonts.addEventListener('loadingdone', measure);
  return () => {
    live = false;
    document.fonts.removeEventListener('loadingdone', measure);
  };
};
