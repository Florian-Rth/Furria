export type StorageArea = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const guardedStorage = (open: () => Storage): StorageArea => {
  const fallback = new Map<string, string>();

  return {
    getItem: (key) => {
      const kept = fallback.get(key);

      if (kept !== undefined) {
        return kept;
      }

      try {
        return open().getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        open().setItem(key, value);
        fallback.delete(key);
      } catch {
        fallback.set(key, value);
      }
    },
    removeItem: (key) => {
      fallback.delete(key);
      try {
        open().removeItem(key);
      } catch {
        return;
      }
    },
  };
};

export const safeSessionStorage: StorageArea = guardedStorage(() => window.sessionStorage);

export const safeLocalStorage: StorageArea = guardedStorage(() => window.localStorage);
