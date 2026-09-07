export interface SessionStoragePort {
  readRefreshToken(): string | null;
  writeRefreshToken(token: string): boolean;
  clearRefreshToken(): void;
}

export const REFRESH_TOKEN_KEY = 'furria.club-app.refresh-token';

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

const readStoredToken = (storage: Storage): string | null => {
  const stored = storage.getItem(REFRESH_TOKEN_KEY);
  return stored === null || stored === '' ? null : stored;
};

const writeStoredToken = (storage: Storage, token: string): boolean => {
  storage.setItem(REFRESH_TOKEN_KEY, token);
  return readStoredToken(storage) === token;
};

export const createLocalStorageSessionStoragePort = (): SessionStoragePort => ({
  readRefreshToken: (): string | null => runGuarded(readStoredToken, null),
  writeRefreshToken: (token: string): boolean =>
    runGuarded((storage) => writeStoredToken(storage, token), false),
  clearRefreshToken: (): void =>
    runGuarded<void>((storage) => {
      storage.removeItem(REFRESH_TOKEN_KEY);
    }, undefined),
});
