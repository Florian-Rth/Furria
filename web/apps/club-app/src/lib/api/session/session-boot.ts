import { Capacitor } from '@capacitor/core';
import { createSecureStorageSessionStoragePort } from './secure-session-storage-port';
import type { SessionStoragePort } from './session-storage-port';
import { createLocalStorageSessionStoragePort } from './session-storage-port';
import { restoreSession, setSessionStoragePort } from './session-store';

const createSessionStoragePort = async (): Promise<SessionStoragePort> =>
  Capacitor.isNativePlatform()
    ? await createSecureStorageSessionStoragePort()
    : createLocalStorageSessionStoragePort();

export const startSession = async (): Promise<void> => {
  setSessionStoragePort(await createSessionStoragePort());
  await restoreSession();
};
