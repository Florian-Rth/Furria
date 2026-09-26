import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { appLinkTargetOf } from '../app-link-target';

export const useAppLinks = (): void => {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const clubAppBaseUrl = readApiBaseUrl();
    let active = true;

    void App.getLaunchUrl().then((launch) => {
      const target = launch === undefined ? null : appLinkTargetOf(launch.url, clubAppBaseUrl);
      if (active && target !== null) {
        router.history.replace(target);
      }
    });

    const listener = App.addListener('appUrlOpen', ({ url }) => {
      const target = appLinkTargetOf(url, clubAppBaseUrl);
      if (target !== null) {
        router.history.push(target);
      }
    });

    return () => {
      active = false;
      void listener.then((handle) => handle.remove());
    };
  }, [router]);
};
