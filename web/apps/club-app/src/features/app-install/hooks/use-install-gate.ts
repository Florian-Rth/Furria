import { Capacitor } from '@capacitor/core';
import { useLocation } from '@tanstack/react-router';
import { useState, useSyncExternalStore } from 'react';
import { readBrowserMode, subscribeToBrowserMode } from '../browser-mode-store';
import { readInstallTarget } from '../install-environment';
import { isInstallGateClosed } from '../install-gate';
import { readStandalone, subscribeToStandalone } from '../standalone-store';

const assumeOff = (): boolean => false;

export interface InstallGate {
  isClosed: boolean;
  showsBrowserModeTag: boolean;
}

export const useInstallGate = (): InstallGate => {
  const { pathname } = useLocation();
  const [{ device }] = useState(readInstallTarget);
  const isStandalone = useSyncExternalStore(subscribeToStandalone, readStandalone, assumeOff);
  const isBrowserMode = useSyncExternalStore(subscribeToBrowserMode, readBrowserMode, assumeOff);
  const isClosed = isInstallGateClosed({
    device,
    isNative: Capacitor.isNativePlatform(),
    isStandalone,
    isBrowserMode,
    pathname,
  });

  const showsBrowserModeTag = isBrowserMode && !isStandalone && device !== 'desktop';

  return { isClosed, showsBrowserModeTag };
};
