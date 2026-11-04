import type { InstallDevice } from './install-browser';

export interface InstallGateInput {
  device: InstallDevice;
  isNative: boolean;
  isStandalone: boolean;
  isBrowserMode: boolean;
  pathname: string;
}

const TAB_LINK_PATHS = [
  /^\/reset-password\/?$/,
  /^\/invitation(\/.*)?$/,
  /^\/photos\/?$/,
  /^\/beer-list\/book\/?$/,
];

export const isTabLinkPath = (pathname: string): boolean =>
  TAB_LINK_PATHS.some((path) => path.test(pathname));

export const isInstallGateClosed = ({
  device,
  isNative,
  isStandalone,
  isBrowserMode,
  pathname,
}: InstallGateInput): boolean =>
  device !== 'desktop' && !isNative && !isStandalone && !isBrowserMode && !isTabLinkPath(pathname);
