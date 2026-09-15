import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);

  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

const readConnection = (): boolean => navigator.onLine;

const assumeConnected = (): boolean => true;

export const useIsOnline = (): boolean =>
  useSyncExternalStore(subscribe, readConnection, assumeConnected);
