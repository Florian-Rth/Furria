import type { MotionValue } from 'motion/react';
import { createContext, useContext } from 'react';
import type { KkChromeMotion } from '../../../internal/chrome-density';

export interface KkShellScroll {
  scrollY: MotionValue<number>;
  motion: KkChromeMotion;
}

export const KkShellScrollContext = createContext<KkShellScroll | null>(null);

export const useKkShellScroll = (): KkShellScroll => {
  const scroll = useContext(KkShellScrollContext);

  if (scroll === null) {
    throw new Error('A shell scroll reader was rendered outside KkShell.');
  }

  return scroll;
};
