const INSTALL_EVENT = 'furria:install';

export const subscribeToInstall = (onChange: () => void): (() => void) => {
  window.addEventListener(INSTALL_EVENT, onChange);
  return () => {
    window.removeEventListener(INSTALL_EVENT, onChange);
  };
};

export const readInstallPrompt = (): BeforeInstallPromptEvent | null =>
  window.__installPrompt ?? null;

export const readAppInstalled = (): boolean => window.__appInstalled === true;

export const forgetInstallPrompt = (): void => {
  window.__installPrompt = null;
  window.dispatchEvent(new Event(INSTALL_EVENT));
};
