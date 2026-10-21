(() => {
  const announce = () => window.dispatchEvent(new Event('furria:install'));
  window.__installPrompt = null;
  window.__appInstalled = false;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.__installPrompt = event;
    announce();
  });
  window.addEventListener('appinstalled', () => {
    window.__installPrompt = null;
    window.__appInstalled = true;
    announce();
  });
})();
