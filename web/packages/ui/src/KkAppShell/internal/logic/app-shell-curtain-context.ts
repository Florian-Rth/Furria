import { createContext, useContext } from 'react';

export interface AppShellCurtain {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const AppShellCurtainContext = createContext<AppShellCurtain | null>(null);

export const useAppShellCurtain = (): AppShellCurtain => {
  const curtain = useContext(AppShellCurtainContext);

  if (curtain === null) {
    throw new Error('useAppShellCurtain must be used inside KkAppShell.');
  }

  return curtain;
};
