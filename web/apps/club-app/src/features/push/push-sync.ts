import {
  getSessionSnapshot,
  subscribeToSession,
  withFreshAccessToken,
} from '@/lib/api/session/session-store';
import { resyncThisDevice, unsubscribeLocally, unsubscribeThisDevice } from './push-device';
import { PushOpenMessageSchema } from './schemas';

let wasAuthenticated = false;

const ignoreFailure = (): void => undefined;

const isAuthenticated = (): boolean => getSessionSnapshot().status === 'authenticated';

const resync = (): void => {
  void withFreshAccessToken(resyncThisDevice).catch(ignoreFailure);
};

const resyncOnSignIn = (): void => {
  const authenticated = isAuthenticated();
  if (authenticated && !wasAuthenticated) {
    resync();
  }
  wasAuthenticated = authenticated;
};

const resyncInForeground = (): void => {
  if (document.visibilityState === 'visible' && isAuthenticated()) {
    resync();
  }
};

export const startPushSync = (): void => {
  subscribeToSession(resyncOnSignIn);
  document.addEventListener('visibilitychange', resyncInForeground);
  resyncOnSignIn();
};

export const releaseThisDevice = async (): Promise<void> => {
  try {
    await withFreshAccessToken(unsubscribeThisDevice);
  } catch {
    await unsubscribeLocally().catch(ignoreFailure);
  }
};

export const listenForPushOpens = (open: (path: string) => void): void => {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
    const message = PushOpenMessageSchema.safeParse(event.data);
    if (message.success) {
      open(message.data.path);
    }
  });
};
