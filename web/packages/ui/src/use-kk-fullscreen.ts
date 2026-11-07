import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

type FullscreenMode = 'off' | 'native' | 'takeover';

export interface KkFullscreen {
  target: RefObject<HTMLDivElement | null>;
  active: boolean;
  toggle: () => void;
}

const nextModeOf = (current: FullscreenMode, owned: boolean): FullscreenMode => {
  if (owned) {
    return 'native';
  }

  return current === 'native' ? 'off' : current;
};

const nativeReady = (element: HTMLElement): boolean =>
  document.fullscreenEnabled === true && typeof element.requestFullscreen === 'function';

const leaveNative = (): void => {
  if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
    void document.exitFullscreen().catch(() => undefined);
  }
};

const raiseToTopLayer = (element: HTMLElement): (() => void) => {
  if (typeof element.showPopover !== 'function') {
    return () => undefined;
  }
  element.setAttribute('popover', 'manual');
  element.showPopover();

  return () => {
    if (element.matches(':popover-open')) {
      element.hidePopover();
    }
    element.removeAttribute('popover');
  };
};

export const useKkFullscreen = (): KkFullscreen => {
  const target = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<FullscreenMode>('off');

  useEffect(() => {
    const sync = (): void => {
      const owned = target.current !== null && document.fullscreenElement === target.current;
      setMode((current) => nextModeOf(current, owned));
    };
    document.addEventListener('fullscreenchange', sync);

    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (target.current !== null && document.fullscreenElement === target.current) {
        leaveNative();
      }
    };
  }, []);

  useEffect(() => {
    const element = target.current;
    if (mode !== 'takeover' || element === null) {
      return;
    }
    const restore = raiseToTopLayer(element);
    const leave = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setMode('off');
      }
    };
    window.addEventListener('keydown', leave);

    return () => {
      window.removeEventListener('keydown', leave);
      restore();
    };
  }, [mode]);

  const toggle = (): void => {
    if (mode === 'native') {
      leaveNative();
      return;
    }
    if (mode === 'takeover') {
      setMode('off');
      return;
    }
    const element = target.current;
    if (element === null) {
      return;
    }
    if (!nativeReady(element)) {
      setMode('takeover');
      return;
    }
    void element.requestFullscreen().catch(() => {
      setMode('takeover');
    });
  };

  return { target, active: mode !== 'off', toggle };
};
