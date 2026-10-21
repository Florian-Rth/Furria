import { registerSW } from 'virtual:pwa-register';

const UPDATE_CHECK_MS = 60 * 60 * 1000;
const UPDATE_EVENT = 'furria:app-update';

let isUpdateReady = false;
let reloadIntoUpdate: (() => Promise<void>) | null = null;

const announce = (): void => {
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

const checkRegularly = (registration: ServiceWorkerRegistration | undefined): void => {
  if (registration === undefined) {
    return;
  }
  window.setInterval(() => {
    void registration.update();
  }, UPDATE_CHECK_MS);
};

export const startAppUpdates = (): void => {
  const updateServiceWorker = registerSW({
    onNeedRefresh: () => {
      isUpdateReady = true;
      announce();
    },
    onRegisteredSW: (_url, registration) => {
      checkRegularly(registration);
    },
  });
  reloadIntoUpdate = () => updateServiceWorker(true);
};

export const subscribeToAppUpdate = (onChange: () => void): (() => void) => {
  window.addEventListener(UPDATE_EVENT, onChange);
  return () => {
    window.removeEventListener(UPDATE_EVENT, onChange);
  };
};

export const readAppUpdateReady = (): boolean => isUpdateReady;

export const applyAppUpdate = (): void => {
  void reloadIntoUpdate?.();
};
