import { SessionEndMessageSchema } from './schemas';
import { REFRESH_TOKEN_KEY } from './session-storage-port';

const SESSION_CHANNEL_NAME = 'furria-club-app-session';

export type RemoteSessionEndListener = (expired: boolean) => void;

const openChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  try {
    return new BroadcastChannel(SESSION_CHANNEL_NAME);
  } catch {
    return null;
  }
};

const channel = openChannel();

export const broadcastSessionEnd = (expired: boolean): void => {
  channel?.postMessage({ expired });
};

export const listenForRemoteSessionEnd = (listener: RemoteSessionEndListener): void => {
  if (channel !== null) {
    channel.onmessage = (event: MessageEvent): void => {
      listener(SessionEndMessageSchema.parse(event.data).expired);
    };
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  window.addEventListener('storage', (event) => {
    if (event.key === REFRESH_TOKEN_KEY && event.newValue === null) {
      listener(false);
    }
  });
};
