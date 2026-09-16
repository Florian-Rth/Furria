import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export const useBackButton = (): void => {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        router.history.back();
        return;
      }

      void App.exitApp();
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [router]);
};
