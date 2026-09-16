import { Capacitor, SystemBars } from '@capacitor/core';
import { useKkColorScheme } from '@furria/ui';
import { useEffect } from 'react';
import { systemBarsStyleFor } from '../system-bars-style';

export const useSystemBarsStyle = (): void => {
  const scheme = useKkColorScheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    void SystemBars.setStyle({ style: systemBarsStyleFor(scheme) });
  }, [scheme]);
};
