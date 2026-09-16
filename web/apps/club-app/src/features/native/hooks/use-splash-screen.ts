import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';
import { useSessionSnapshot } from '@/features/session';

export const useSplashScreen = (): void => {
  const { status } = useSessionSnapshot();
  const bootDecided = status !== 'restoring';

  useEffect(() => {
    if (!bootDecided || !Capacitor.isNativePlatform()) {
      return;
    }

    void SplashScreen.hide();
  }, [bootDecided]);
};
