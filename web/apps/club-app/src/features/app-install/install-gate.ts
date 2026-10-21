import type { InstallDevice } from './install-browser';

export interface InstallGateInput {
  device: InstallDevice;
  isNative: boolean;
  isStandalone: boolean;
  isBrowserMode: boolean;
  pathname: string;
}

const MAIL_LINK_PATHS = [/^\/reset-password\/?$/, /^\/invitation(\/.*)?$/];

export const isMailLinkPath = (pathname: string): boolean =>
  MAIL_LINK_PATHS.some((path) => path.test(pathname));

export const isInstallGateClosed = ({
  device,
  isNative,
  isStandalone,
  isBrowserMode,
  pathname,
}: InstallGateInput): boolean =>
  device !== 'desktop' && !isNative && !isStandalone && !isBrowserMode && !isMailLinkPath(pathname);
