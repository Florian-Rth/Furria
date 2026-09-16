import type { FC } from 'react';
import { useBackButton } from '../hooks/use-back-button';
import { useSplashScreen } from '../hooks/use-splash-screen';
import { useSystemBarsStyle } from '../hooks/use-system-bars-style';

export const NativeChrome: FC = () => {
  useSystemBarsStyle();
  useBackButton();
  useSplashScreen();

  return null;
};
