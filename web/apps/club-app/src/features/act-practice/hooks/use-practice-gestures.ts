import type {
  KkPracticeGlyph,
  KkPracticeScreenHudSignal,
  KkPracticeScreenSurface,
} from '@furria/ui/KkPracticeScreen';
import type { PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Drag, TapZone } from '../practice-controls';
import { dragOf, swipedRateOf, tapZoneOf } from '../practice-controls';
import {
  PRACTICE_PAUSED,
  PRACTICE_RUNNING,
  PRACTICE_STEP_BACK,
  PRACTICE_STEP_FORWARD,
  rateTextOf,
} from '../practice-copy';
import { ratePercentOf } from '../practice-stepping';
import type { Practice } from './use-practice';

const DOUBLE_TAP_MS = 350;

interface Touch {
  x: number;
  y: number;
  width: number;
  height: number;
  share: number;
  drag: Drag;
  second: boolean;
}

interface LastTap {
  zone: TapZone;
  at: number;
}

export interface PracticeGestures {
  surface: KkPracticeScreenSurface;
  signal: KkPracticeScreenHudSignal | null;
}

export const usePracticeGestures = (practice: Practice): PracticeGestures => {
  const [signal, setSignal] = useState<KkPracticeScreenHudSignal | null>(null);
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

  const show = (glyph: KkPracticeGlyph, text: string): void => {
    stamp.current += 1;
    setSignal({ stamp: stamp.current, glyph, text, held: false });
  };

  const toggle = (): void => {
    show(
      practice.playing ? 'pause' : 'play',
      practice.playing ? PRACTICE_PAUSED : PRACTICE_RUNNING,
    );
    practice.toggle();
  };

  const skip = (zone: TapZone): void => {
    const back = zone === 'back';
    practice.skip(back ? 'back' : 'forward');
    show(back ? 'back' : 'forward', back ? PRACTICE_STEP_BACK : PRACTICE_STEP_FORWARD);
  };

  const riseOf = (event: PointerEvent<HTMLDivElement>, start: Touch): number =>
    start.height <= 0 ? 0 : (start.y - event.clientY) / start.height;

  const isSecondTap = (zone: TapZone, now: number): boolean => {
    const previous = lastTap.current;

    return (
      tapTimer.current !== null &&
      previous !== null &&
      previous.zone === zone &&
      now - previous.at < DOUBLE_TAP_MS
    );
  };

  const keepFirstTap = (start: Touch): void => {
    if (start.second) {
      lastTap.current = null;
      toggle();
    }
  };

  const tap = (zone: TapZone, second: boolean): void => {
    clear(tapTimer);
    if (second) {
      lastTap.current = null;
      skip(zone);
      return;
    }
    if (zone === 'middle') {
      lastTap.current = null;
      toggle();
      return;
    }
    lastTap.current = { zone, at: performance.now() };
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      lastTap.current = null;
      toggle();
    }, DOUBLE_TAP_MS);
  };

  return {
    signal,
    surface: {
      onPointerDown: (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.setPointerCapture(event.pointerId);
        const share = box.width <= 0 ? 0.5 : (event.clientX - box.left) / box.width;
        const second = isSecondTap(tapZoneOf(share), performance.now());
        if (second) {
          clear(tapTimer);
        }
        touch.current = {
          x: event.clientX,
          y: event.clientY,
          width: box.width,
          height: box.height,
          share,
          drag: 'none',
          second,
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
        if (start.drag !== 'none') {
          keepFirstTap(start);
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
        tap(tapZoneOf(start.share), start.second);
      },
      onPointerCancel: () => {
        const start = touch.current;
        touch.current = null;
        if (start !== null) {
          keepFirstTap(start);
        }
      },
    },
  };
};
