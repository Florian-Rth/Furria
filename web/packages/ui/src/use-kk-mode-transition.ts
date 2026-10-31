import { useColorScheme } from '@mui/material/styles';
import { useReducedMotion } from 'motion/react';
import { flushSync } from 'react-dom';
import type { OriginRect } from './reveal-geometry';
import { computeRevealGeometry } from './reveal-geometry';
import type { KkColorSchemeMode, KkResolvedColorScheme } from './theme-color';
import { resolveKkColorScheme } from './theme-color';

interface KkModeTransition {
  mode: KkColorSchemeMode;
  resolved: KkResolvedColorScheme;
  switchTo: (next: KkColorSchemeMode, origin: OriginRect) => void;
  toggle: (origin: OriginRect) => void;
}

const canRunViewTransition = (): boolean =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

const placeReveal = (origin: OriginRect): void => {
  const { centerXPercent, centerYPercent } = computeRevealGeometry(
    origin,
    window.innerWidth,
    window.innerHeight,
  );
  const root = document.documentElement;
  root.style.setProperty('--mode-reveal-x', `${centerXPercent}%`);
  root.style.setProperty('--mode-reveal-y', `${centerYPercent}%`);
};

export const useKkModeTransition = (): KkModeTransition => {
  const { mode, systemMode, setMode } = useColorScheme();
  const reducedMotion = useReducedMotion();
  const resolved = resolveKkColorScheme(mode, systemMode);

  const switchTo = (next: KkColorSchemeMode, origin: OriginRect): void => {
    const repaints = resolveKkColorScheme(next, systemMode) !== resolved;

    if (!repaints || reducedMotion === true || !canRunViewTransition()) {
      setMode(next);
      return;
    }

    placeReveal(origin);
    document.startViewTransition(() => {
      flushSync(() => {
        setMode(next);
      });
    });
  };

  const toggle = (origin: OriginRect): void => {
    switchTo(resolved === 'dark' ? 'light' : 'dark', origin);
  };

  return { mode: mode ?? 'system', resolved, switchTo, toggle };
};
