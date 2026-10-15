import { Capacitor } from '@capacitor/core';
import { createSecureStorageSessionStoragePort } from './secure-session-storage-port';
import type { SessionStoragePort } from './session-storage-port';
import {
  createLocalStorageSessionStoragePort,
  createUnavailableSessionStoragePort,
} from './session-storage-port';
import {
  markSessionUnavailable,
  restoreSession,
  setSessionStoragePort,
  subscribeToSessionEnd,
} from './session-store';

const createSessionStoragePort = async (): Promise<SessionStoragePort> =>
  Capacitor.isNativePlatform()
    ? await createSecureStorageSessionStoragePort()
    : createLocalStorageSessionStoragePort();

const forgetResumableUploadsOfTheEndedSession = async (): Promise<void> => {
  const { forgetResumableUploads } = await import('@/lib/media/tus-transport');
  await forgetResumableUploads();
};

const openSessionStorage = async (): Promise<boolean> => {
  try {
    setSessionStoragePort(await createSessionStoragePort());
    return true;
  } catch {
    setSessionStoragePort(createUnavailableSessionStoragePort());
    return false;
  }
};

export const bootSession = async (): Promise<void> => {
  if (!(await openSessionStorage())) {
    markSessionUnavailable();
    return;
  }

  try {
    await restoreSession();
  } catch {
    markSessionUnavailable();
  }
};

export const startSession = async (): Promise<void> => {
  subscribeToSessionEnd(() => {
    void forgetResumableUploadsOfTheEndedSession().catch(() => undefined);
  });
  await bootSession();
};
