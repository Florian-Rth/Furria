import { registerSW } from 'virtual:pwa-register';
import { connectAppUpdate, markAppUpdateReady } from './app-update-store';

const UPDATE_CHECK_MS = 60 * 60 * 1000;

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
    onNeedRefresh: markAppUpdateReady,
    onRegisteredSW: (_url, registration) => {
      checkRegularly(registration);
    },
  });
  connectAppUpdate(() => updateServiceWorker(true));
};
