import { useColorScheme } from '@mui/material/styles';
import { useReducedMotion } from 'motion/react';
import { flushSync } from 'react-dom';
import type { ResolvedColorMode } from '@/lib/color-mode';
import { resolveColorMode } from '@/lib/color-mode';
import { computeRevealGeometry } from './reveal-geometry';

interface ModeTransition {
  resolved: ResolvedColorMode;
  toggle: (origin: DOMRect) => void;
}

const canRunViewTransition = (): boolean =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

export const useModeTransition = (): ModeTransition => {
  const { mode, systemMode, setMode } = useColorScheme();
  const reducedMotion = useReducedMotion();
  const resolved = resolveColorMode(mode, systemMode);

  const toggle = (origin: DOMRect): void => {
    const next: ResolvedColorMode = resolved === 'dark' ? 'light' : 'dark';

    if (reducedMotion === true || !canRunViewTransition()) {
      setMode(next);
      return;
    }

    const { centerX, centerY, radius } = computeRevealGeometry(
      origin,
      window.innerWidth,
      window.innerHeight,
    );
    const root = document.documentElement;
    root.style.setProperty('--mode-reveal-x', `${centerX}px`);
    root.style.setProperty('--mode-reveal-y', `${centerY}px`);
    root.style.setProperty('--mode-reveal-radius', `${radius}px`);

    document.startViewTransition(() => {
      flushSync(() => {
        setMode(next);
      });
    });
  };

  return { resolved, toggle };
};
