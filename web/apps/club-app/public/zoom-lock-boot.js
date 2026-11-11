(() => {
  const preventNativeZoom = (event) => event.preventDefault();
  for (const gesture of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(gesture, preventNativeZoom, { passive: false });
  }
})();
