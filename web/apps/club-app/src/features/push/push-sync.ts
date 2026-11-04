import {
  getSessionSnapshot,
  subscribeToSession,
  withFreshAccessToken,
} from '@/lib/api/session/session-store';
import { resyncThisDevice, unsubscribeThisDevice } from './push-device';
import { PushOpenMessageSchema } from './schemas';

let wasAuthenticated = false;

const ignoreFailure = (): void => undefined;

const resyncOnSignIn = (): void => {
  const authenticated = getSessionSnapshot().status === 'authenticated';
  if (authenticated && !wasAuthenticated) {
    void withFreshAccessToken(resyncThisDevice).catch(ignoreFailure);
  }
  wasAuthenticated = authenticated;
};

export const startPushSync = (): void => {
  subscribeToSession(resyncOnSignIn);
  resyncOnSignIn();
};

export const releaseThisDevice = (): Promise<void> =>
  withFreshAccessToken(unsubscribeThisDevice).catch(ignoreFailure);

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
