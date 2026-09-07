import { UnauthorizedError } from '@/lib/api/api-error';
import type { LoginRequest, SessionTokens } from '@/lib/api/schemas';
import { requestLogin, requestLogout, requestRefresh } from './auth-api';
import {
  captureRemainingLifetime,
  isWithinRefreshMargin,
  REFRESH_MARGIN_MS,
} from './session-lifetime';
import type { SessionStoragePort } from './session-storage-port';
import { createLocalStorageSessionStoragePort } from './session-storage-port';

export type SessionStatus = 'anonymous' | 'restoring' | 'authenticated';

export interface SessionSnapshot {
  readonly status: SessionStatus;
  readonly expired: boolean;
}

const REFRESH_LOCK_NAME = 'furria-club-app-refresh';

let storagePort: SessionStoragePort = createLocalStorageSessionStoragePort();
let accessToken: string | null = null;
let accessTokenReceivedAtMs = 0;
let accessTokenLifetimeMs = 0;
let snapshot: SessionSnapshot = {
  status: storagePort.readRefreshToken() === null ? 'anonymous' : 'restoring',
  expired: false,
};

const listeners = new Set<() => void>();

const publish = (status: SessionStatus, expired: boolean): void => {
  if (snapshot.status === status && snapshot.expired === expired) {
    return;
  }
  snapshot = { status, expired };
  for (const listener of listeners) {
    listener();
  }
};

const adoptTokens = (tokens: SessionTokens): string => {
  const receivedAtMs = Date.now();
  accessToken = tokens.accessToken;
  accessTokenReceivedAtMs = receivedAtMs;
  accessTokenLifetimeMs = captureRemainingLifetime(tokens.accessTokenExpiresAt, receivedAtMs);
  storagePort.writeRefreshToken(tokens.refreshToken);
  publish('authenticated', false);
  return tokens.accessToken;
};

const clearSession = (expired: boolean): void => {
  accessToken = null;
  accessTokenReceivedAtMs = 0;
  accessTokenLifetimeMs = 0;
  storagePort.clearRefreshToken();
  publish('anonymous', expired);
};

const isAccessTokenStale = (nowMs: number): boolean =>
  isWithinRefreshMargin(accessTokenLifetimeMs, nowMs - accessTokenReceivedAtMs, REFRESH_MARGIN_MS);

const withRefreshLock = async <TResult>(run: () => Promise<TResult>): Promise<TResult> => {
  const lockManager = typeof navigator === 'undefined' ? undefined : navigator.locks;
  if (lockManager === undefined) {
    return await run();
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
      !isAccessTokenStale(Date.now())
    ) {
      return currentAccessToken;
    }
    if (storedToken === null) {
      clearSession(true);
      throw new UnauthorizedError();
    }

    try {
      return adoptTokens(await requestRefresh(storedToken));
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        clearSession(true);
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

export const setSessionStoragePort = (port: SessionStoragePort): void => {
  storagePort = port;
};

export const hasStoredSession = (): boolean => storagePort.readRefreshToken() !== null;

export const ensureFreshAccessToken = async (): Promise<string> => {
  const currentAccessToken = accessToken;
  if (currentAccessToken !== null && !isAccessTokenStale(Date.now())) {
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
      clearSession(true);
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
  if (refreshToken !== null) {
    await revokeQuietly(refreshToken);
  }
  clearSession(false);
};

export const restoreSession = async (): Promise<void> => {
  if (snapshot.status !== 'restoring') {
    return;
  }
  try {
    await ensureFreshAccessToken();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return;
    }
    publish('anonymous', false);
  }
};
