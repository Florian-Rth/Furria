import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { AppShellCurtainContext } from './app-shell-curtain-context';

export const AppShellCurtainProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = (): void => {
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  return (
    <AppShellCurtainContext.Provider value={{ isOpen, open, close }}>
      {children}
    </AppShellCurtainContext.Provider>
  );
};
