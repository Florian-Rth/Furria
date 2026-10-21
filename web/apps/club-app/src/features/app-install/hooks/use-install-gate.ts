import { Capacitor } from '@capacitor/core';
import { useLocation } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';
import { readBrowserMode, subscribeToBrowserMode } from '../browser-mode-store';
import { INSTALL_TARGET } from '../install-environment';
import { isInstallGateClosed } from '../install-gate';
import { readStandalone, subscribeToStandalone } from '../standalone-store';

const assumeOff = (): boolean => false;

export interface InstallGate {
  isClosed: boolean;
  showsBrowserModeTag: boolean;
}

export const useInstallGate = (): InstallGate => {
  const { pathname } = useLocation();
  const isStandalone = useSyncExternalStore(subscribeToStandalone, readStandalone, assumeOff);
  const isBrowserMode = useSyncExternalStore(subscribeToBrowserMode, readBrowserMode, assumeOff);
  const isClosed = isInstallGateClosed({
    device: INSTALL_TARGET.device,
    isNative: Capacitor.isNativePlatform(),
    isStandalone,
    isBrowserMode,
    pathname,
  });

  const showsBrowserModeTag = isBrowserMode && !isStandalone && INSTALL_TARGET.device !== 'desktop';

  return { isClosed, showsBrowserModeTag };
};
