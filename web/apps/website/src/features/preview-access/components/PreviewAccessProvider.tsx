import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { PreviewAccessContext } from '../preview-access-context';
import { readGrantedFromSession, writeGrantedToSession } from '../session-storage';

export const PreviewAccessProvider: FC<PropsWithChildren> = ({ children }) => {
  const [granted, setGranted] = useState(() => readGrantedFromSession(window.sessionStorage));

  const grantAccess = (): void => {
    writeGrantedToSession(window.sessionStorage);
    setGranted(true);
  };

  return (
    <PreviewAccessContext.Provider value={{ granted, grantAccess }}>
      {children}
    </PreviewAccessContext.Provider>
  );
};
