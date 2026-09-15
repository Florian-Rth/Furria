import type { ElementType } from 'react';
import { createContext, useContext } from 'react';
import type { KkShellDestination } from '../../shell-destination';
import type { KkHandover } from './handover';

export interface KkShellState {
  density: number;
  handover: KkHandover;
  link: ElementType;
  destinations: readonly KkShellDestination[];
  keyboardInset: number;
}

export const KkShellContext = createContext<KkShellState | null>(null);

export const useKkShell = (): KkShellState => {
  const shell = useContext(KkShellContext);

  if (shell === null) {
    throw new Error('A shell layer was rendered outside KkShell.');
  }

  return shell;
};
