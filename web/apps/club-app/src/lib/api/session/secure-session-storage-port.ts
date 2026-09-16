import type { SessionStoragePort } from './session-storage-port';
import {
  normalizeStoredToken,
  REFRESH_TOKEN_NAME,
  SESSION_KEY_PREFIX,
} from './session-storage-port';

export const createSecureStorageSessionStoragePort = async (): Promise<SessionStoragePort> => {
  const { KeychainAccess, SecureStorage } = await import('@aparajita/capacitor-secure-storage');

  const scopeToTheApp = async (): Promise<void> => {
    try {
      await SecureStorage.setKeyPrefix(SESSION_KEY_PREFIX);
      await SecureStorage.setSynchronize(false);
      await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlocked);
    } catch {
      return;
    }
  };

  const forgetRefreshToken = async (): Promise<void> => {
    try {
      await SecureStorage.removeItem(REFRESH_TOKEN_NAME);
    } catch {
      return;
    }
  };

  await scopeToTheApp();

  return {
    readRefreshToken: async (): Promise<string | null> => {
      try {
        return normalizeStoredToken(await SecureStorage.getItem(REFRESH_TOKEN_NAME));
      } catch {
        await forgetRefreshToken();
        return null;
      }
    },
    writeRefreshToken: async (token: string): Promise<boolean> => {
      try {
        await SecureStorage.setItem(REFRESH_TOKEN_NAME, token);
        return true;
      } catch {
        return false;
      }
    },
    clearRefreshToken: forgetRefreshToken,
  };
};
