import { Capacitor } from '@capacitor/core';
import { createSecureStorageSessionStoragePort } from './secure-session-storage-port';
import type { SessionStoragePort } from './session-storage-port';
import { createLocalStorageSessionStoragePort } from './session-storage-port';
import { restoreSession, setSessionStoragePort, subscribeToSessionEnd } from './session-store';

const createSessionStoragePort = async (): Promise<SessionStoragePort> =>
  Capacitor.isNativePlatform()
    ? await createSecureStorageSessionStoragePort()
    : createLocalStorageSessionStoragePort();

const forgetResumableUploadsOfTheEndedSession = async (): Promise<void> => {
  const { forgetResumableUploads } = await import('@/lib/media/tus-transport');
  await forgetResumableUploads();
};

export const startSession = async (): Promise<void> => {
  subscribeToSessionEnd(() => {
    void forgetResumableUploadsOfTheEndedSession().catch(() => undefined);
  });
  setSessionStoragePort(await createSessionStoragePort());
  await restoreSession();
};
