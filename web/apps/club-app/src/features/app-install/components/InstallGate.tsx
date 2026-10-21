import type { FC, PropsWithChildren } from 'react';
import { useInstallGate } from '../hooks/use-install-gate';
import { BrowserModeTag } from './BrowserModeTag';
import { InstallScreen } from './InstallScreen';

export const InstallGate: FC<PropsWithChildren> = ({ children }) => {
  const { isClosed, showsBrowserModeTag } = useInstallGate();

  if (isClosed) {
    return <InstallScreen />;
  }

  const browserModeTag = showsBrowserModeTag ? <BrowserModeTag /> : null;

  return (
    <>
      {browserModeTag}
      {children}
    </>
  );
};
