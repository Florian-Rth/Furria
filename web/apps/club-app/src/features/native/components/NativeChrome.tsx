import type { FC } from 'react';
import { useAppLinks } from '../hooks/use-app-links';
import { useBackButton } from '../hooks/use-back-button';
import { useSplashScreen } from '../hooks/use-splash-screen';
import { useSystemBarsStyle } from '../hooks/use-system-bars-style';

export const NativeChrome: FC = () => {
  useSystemBarsStyle();
  useBackButton();
  useAppLinks();
  useSplashScreen();

  return null;
};
