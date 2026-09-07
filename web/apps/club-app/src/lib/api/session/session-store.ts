import { UnauthorizedError } from '@/lib/api/api-error';
import type { LoginRequest, SessionTokens } from '@/lib/api/schemas';
import { requestLogin, requestLogout, requestRefresh } from './auth-api';
import { broadcastSessionEnd, listenForRemoteSessionEnd } from './session-broadcast';
import { SessionPersistenceError } from './session-error';
import {
  captureRemainingLifetime,
  isAccessTokenStale,
  MAX_TRUSTED_LIFETIME_MS,
  MIN_REFRESH_INTERVAL_MS,
  REFRESH_MARGIN_MS,
} from './session-lifetime';
import type { SessionStoragePort } from './session-storage-port';
import { createLocalStorageSessionStoragePort } from './session-storage-port';

export type SessionStatus = 'anonymous' | 'restoring' | 'unavailable' | 'authenticated';

export interface SessionSnapshot {
  readonly status: SessionStatus;
  readonly expired: boolean;
}

const REFRESH_LOCK_NAME = 'furria-club-app-refresh';

let storagePort: SessionStoragePort = createLocalStorageSessionStoragePort();
let accessToken: string | null = null;
let accessTokenReceivedAtTicks = 0;
let accessTokenLifetimeMs = 0;
let pendingInTabRefresh: Promise<string> | null = null;
let expiryPublicationSuppressed = false;

const resolveStoredStatus = (): SessionStatus =>
  storagePort.readRefreshToken() === null ? 'anonymous' : 'restoring';

let snapshot: SessionSnapshot = { status: resolveStoredStatus(), expired: false };

const listeners = new Set<() => void>();
const sessionEndListeners = new Set<() => void>();

const publish = (status: SessionStatus, expired: boolean): void => {
  if (snapshot.status === status && snapshot.expired === expired) {
    return;
  }
  snapshot = { status, expired };
  for (const listener of listeners) {
    listener();
  }
};

const forgetTokens = (): void => {
  accessToken = null;
  accessTokenReceivedAtTicks = 0;
  accessTokenLifetimeMs = 0;
  storagePort.clearRefreshToken();
};

const hasLiveSession = (): boolean => snapshot.status !== 'anonymous' || accessToken !== null;

const nextExpiryFlag = (expired: boolean): boolean =>
  snapshot.expired || (expired && hasLiveSession() && !expiryPublicationSuppressed);

const finishSession = (nextExpired: boolean): void => {
  const hadSession = hasLiveSession();
  forgetTokens();
  publish('anonymous', nextExpired);
  if (hadSession) {
    for (const listener of sessionEndListeners) {
      listener();
    }
  }
};

const endSession = (expired: boolean): void => {
  const nextExpired = nextExpiryFlag(expired);
  if (hasLiveSession()) {
    broadcastSessionEnd(nextExpired);
  }
  finishSession(nextExpired);
};

listenForRemoteSessionEnd((expired) => {
  finishSession(snapshot.expired || expired);
});

const adoptTokens = (tokens: SessionTokens): string => {
  const receivedAtMs = Date.now();
  const receivedAtTicks = performance.now();
  if (!storagePort.writeRefreshToken(tokens.refreshToken)) {
    endSession(false);
    throw new SessionPersistenceError();
  }
  accessToken = tokens.accessToken;
  accessTokenReceivedAtTicks = receivedAtTicks;
  accessTokenLifetimeMs = captureRemainingLifetime(
    tokens.accessTokenExpiresAt,
    receivedAtMs,
    MAX_TRUSTED_LIFETIME_MS,
  );
  publish('authenticated', false);
  return tokens.accessToken;
};

const isCurrentAccessTokenStale = (): boolean =>
  isAccessTokenStale(
    accessTokenLifetimeMs,
    performance.now() - accessTokenReceivedAtTicks,
    REFRESH_MARGIN_MS,
    MIN_REFRESH_INTERVAL_MS,
  );

const dedupedInTab = async (run: () => Promise<string>): Promise<string> => {
  const alreadyRunning = pendingInTabRefresh;
  if (alreadyRunning !== null) {
    return await alreadyRunning;
  }
  const started = run();
  pendingInTabRefresh = started;
  try {
    return await started;
  } finally {
    pendingInTabRefresh = null;
  }
};

const withRefreshLock = async (run: () => Promise<string>): Promise<string> => {
  const lockManager = typeof navigator === 'undefined' ? undefined : navigator.locks;
  if (lockManager === undefined) {
    return await dedupedInTab(run);
  }
  return await lockManager.request(REFRESH_LOCK_NAME, run);
};

const refreshThroughLock = async (): Promise<string> => {
  const tokenSeenBeforeLock = storagePort.readRefreshToken();

  return await withRefreshLock(async () => {
    const storedToken = storagePort.readRefreshToken();
    const currentAccessToken = accessToken;

    if (
      storedToken !== tokenSeenBeforeLock &&
      currentAccessToken !== null &&
      !isCurrentAccessTokenStale()
    ) {
      return currentAccessToken;
    }
    if (storedToken === null) {
      endSession(true);
      throw new UnauthorizedError();
    }

    try {
      return adoptTokens(await requestRefresh(storedToken));
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        endSession(true);
      }
      throw error;
    }
  });
};

export const getSessionSnapshot = (): SessionSnapshot => snapshot;

export const subscribeToSession = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const subscribeToSessionEnd = (listener: () => void): (() => void) => {
  sessionEndListeners.add(listener);
  return () => {
    sessionEndListeners.delete(listener);
  };
};

export const setSessionStoragePort = (port: SessionStoragePort): void => {
  storagePort = port;
  if (accessToken !== null) {
    return;
  }
  publish(resolveStoredStatus(), snapshot.expired);
};

export const hasStoredSession = (): boolean => storagePort.readRefreshToken() !== null;

export const ensureFreshAccessToken = async (): Promise<string> => {
  const currentAccessToken = accessToken;
  if (currentAccessToken !== null && !isCurrentAccessTokenStale()) {
    return currentAccessToken;
  }
  return await refreshThroughLock();
};

export const withFreshAccessToken = async <TResult>(
  call: (token: string) => Promise<TResult>,
): Promise<TResult> => {
  const token = await ensureFreshAccessToken();
  try {
    return await call(token);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      endSession(true);
    }
    throw error;
  }
};

export const signIn = async (credentials: LoginRequest): Promise<void> => {
  adoptTokens(await requestLogin(credentials));
};

const revokeQuietly = async (refreshToken: string): Promise<void> => {
  try {
    await withFreshAccessToken((token) => requestLogout(token, refreshToken));
  } catch {
    return;
  }
};

export const signOut = async (): Promise<void> => {
  const refreshToken = storagePort.readRefreshToken();
  expiryPublicationSuppressed = true;
  try {
    if (refreshToken !== null) {
      await revokeQuietly(refreshToken);
    }
    broadcastSessionEnd(false);
    finishSession(snapshot.expired);
  } finally {
    expiryPublicationSuppressed = false;
  }
};

export const restoreSession = async (): Promise<void> => {
  if (snapshot.status === 'authenticated') {
    return;
  }
  if (storagePort.readRefreshToken() === null) {
    publish('anonymous', snapshot.expired);
    return;
  }
  publish('restoring', false);
  try {
    await ensureFreshAccessToken();
  } catch {
    if (storagePort.readRefreshToken() === null) {
      return;
    }
    publish('unavailable', false);
  }
};
