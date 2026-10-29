import type {
  KkStudioEGlyph,
  KkStudioEScreenHudSignal,
  KkStudioEScreenSurface,
} from '@furria/ui/KkStudioEScreen';
import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Drag, TapZone } from '../studio-e-controls';
import { dragOf, swipedRateOf, tapZoneOf } from '../studio-e-controls';
import {
  rateTextOf,
  STUDIO_E_PAUSED,
  STUDIO_E_RUNNING,
  STUDIO_E_STEP_BACK,
  STUDIO_E_STEP_FORWARD,
} from '../studio-e-copy';
import { ratePercentOf } from '../studio-e-practice';
import type { StudioEPractice } from './use-studio-e-practice';

const DOUBLE_TAP_MS = 280;

interface Touch {
  x: number;
  y: number;
  width: number;
  height: number;
  share: number;
  drag: Drag;
}

interface LastTap {
  zone: TapZone;
  at: number;
}

export interface StudioEGestures {
  surface: KkStudioEScreenSurface;
  signal: KkStudioEScreenHudSignal | null;
}

export const useStudioEGestures = (practice: StudioEPractice): StudioEGestures => {
  const [signal, setSignal] = useState<KkStudioEScreenHudSignal | null>(null);
  const touch = useRef<Touch | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef<LastTap | null>(null);
  const stamp = useRef(0);

  const clear = (timer: { current: ReturnType<typeof setTimeout> | null }): void => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(
    () => () => {
      clear(tapTimer);
    },
    [],
  );

  const show = (glyph: KkStudioEGlyph, text: string): void => {
    stamp.current += 1;
    setSignal({ stamp: stamp.current, glyph, text, held: false });
  };

  const toggle = (): void => {
    show(
      practice.playing ? 'pause' : 'play',
      practice.playing ? STUDIO_E_PAUSED : STUDIO_E_RUNNING,
    );
    practice.toggle();
  };

  const skip = (zone: TapZone): void => {
    const back = zone === 'back';
    practice.skip(back ? 'back' : 'forward');
    show(back ? 'back' : 'forward', back ? STUDIO_E_STEP_BACK : STUDIO_E_STEP_FORWARD);
  };

  const riseOf = (event: PointerEvent<HTMLDivElement>, start: Touch): number =>
    start.height <= 0 ? 0 : (start.y - event.clientY) / start.height;

  const tap = (zone: TapZone): void => {
    const now = performance.now();
    const previous = lastTap.current;
    lastTap.current = { zone, at: now };

    if (zone === 'middle') {
      clear(tapTimer);
      toggle();
      return;
    }
    if (previous !== null && previous.zone === zone && now - previous.at < DOUBLE_TAP_MS) {
      clear(tapTimer);
      skip(zone);
      return;
    }
    clear(tapTimer);
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      toggle();
    }, DOUBLE_TAP_MS);
  };

  return {
    signal,
    surface: {
      onPointerDown: (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.setPointerCapture(event.pointerId);
        touch.current = {
          x: event.clientX,
          y: event.clientY,
          width: box.width,
          height: box.height,
          share: box.width <= 0 ? 0.5 : (event.clientX - box.left) / box.width,
          drag: 'none',
        };
      },
      onPointerMove: (event) => {
        const start = touch.current;
        if (start === null) {
          return;
        }
        const drag =
          start.drag === 'none'
            ? dragOf(event.clientX - start.x, event.clientY - start.y)
            : start.drag;
        if (drag === 'none') {
          return;
        }
        start.drag = drag;
        if (drag === 'vertical') {
          const rate = swipedRateOf(practice.rate, riseOf(event, start));
          setSignal({
            stamp: -1,
            glyph: 'speed',
            text: rateTextOf(ratePercentOf(rate)),
            held: true,
          });
        }
      },
      onPointerUp: (event) => {
        const start = touch.current;
        touch.current = null;
        if (start === null) {
          return;
        }
        if (start.drag === 'vertical') {
          const rate = swipedRateOf(practice.rate, riseOf(event, start));
          practice.setRate(rate);
          show('speed', rateTextOf(ratePercentOf(rate)));
          return;
        }
        if (start.drag === 'horizontal') {
          skip(event.clientX < start.x ? 'forward' : 'back');
          return;
        }
        tap(tapZoneOf(start.share));
      },
      onPointerCancel: () => {
        touch.current = null;
      },
    },
  };
};
