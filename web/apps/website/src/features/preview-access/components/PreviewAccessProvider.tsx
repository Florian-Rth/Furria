import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { safeSessionStorage } from '@/lib/browser-storage';
import { PreviewAccessContext } from '../preview-access-context';
import { readGrantedFromSession, writeGrantedToSession } from '../session-storage';

export const PreviewAccessProvider: FC<PropsWithChildren> = ({ children }) => {
  const [granted, setGranted] = useState(() => readGrantedFromSession(safeSessionStorage));

  const grantAccess = (): void => {
    writeGrantedToSession(safeSessionStorage);
    setGranted(true);
  };

  return (
    <PreviewAccessContext.Provider value={{ granted, grantAccess }}>
      {children}
    </PreviewAccessContext.Provider>
  );
};
