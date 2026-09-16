export interface SessionStoragePort {
  readRefreshToken(): Promise<string | null>;
  writeRefreshToken(token: string): Promise<boolean>;
  clearRefreshToken(): Promise<void>;
}

export const SESSION_KEY_PREFIX = 'furria.club-app.';
export const REFRESH_TOKEN_NAME = 'refresh-token';
export const REFRESH_TOKEN_KEY = `${SESSION_KEY_PREFIX}${REFRESH_TOKEN_NAME}`;

const resolveLocalStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

const runGuarded = <TResult>(
  operation: (storage: Storage) => TResult,
  fallback: TResult,
): TResult => {
  const storage = resolveLocalStorage();
  if (storage === null) {
    return fallback;
  }
  try {
    return operation(storage);
  } catch {
    return fallback;
  }
};

export const normalizeStoredToken = (stored: string | null): string | null =>
  stored === null || stored === '' ? null : stored;

export const readStoredToken = (storage: Storage): string | null =>
  normalizeStoredToken(storage.getItem(REFRESH_TOKEN_KEY));

export const writeStoredToken = (storage: Storage, token: string): boolean => {
  storage.setItem(REFRESH_TOKEN_KEY, token);
  return readStoredToken(storage) === token;
};

export const createLocalStorageSessionStoragePort = (): SessionStoragePort => ({
  readRefreshToken: (): Promise<string | null> =>
    Promise.resolve(runGuarded(readStoredToken, null)),
  writeRefreshToken: (token: string): Promise<boolean> =>
    Promise.resolve(runGuarded((storage) => writeStoredToken(storage, token), false)),
  clearRefreshToken: (): Promise<void> =>
    Promise.resolve(
      runGuarded<void>((storage) => {
        storage.removeItem(REFRESH_TOKEN_KEY);
      }, undefined),
    ),
});
