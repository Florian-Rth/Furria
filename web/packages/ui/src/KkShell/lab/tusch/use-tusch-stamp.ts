import type { AnimationPlaybackControls } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import type { TuschStaging } from './measure-tusch';
import { measureTusch, sameStaging } from './measure-tusch';
import { CHROME_SELECTOR, onRemeasure } from './tusch-dom';
import type { TuschPlan } from './tusch-score';
import {
  buzzPatternOf,
  contactOf,
  crossingOf,
  planStrike,
  strikeDurationOf,
  strikeFrameAt,
  TUSCH_THRESHOLD,
} from './tusch-score';
import type { TuschValues } from './use-tusch-values';
import { applyFrame, useTuschValues } from './use-tusch-values';

export interface TuschStamp {
  slotRef: RefObject<HTMLDivElement | null>;
  copyRef: RefObject<HTMLDivElement | null>;
  chrome: HTMLElement | null;
  staging: TuschStaging | null;
  values: TuschValues;
}

const RETURN = { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] } as const;
const LIFT_OFF = { duration: 0.16, ease: 'easeIn' } as const;
const LIFT_OFF_SCALE = 1.08;
const RETURN_FROM_Y = -6;

const buzz = (pattern: number | number[]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

const paintChrome = (chrome: HTMLElement | null, scale: number): void => {
  if (chrome === null) {
    return;
  }

  if (scale === 1) {
    chrome.style.removeProperty('transform');
    return;
  }

  chrome.style.transform = `scale(${scale})`;
};

export const useTuschStamp = (): TuschStamp => {
  const { scrollY } = useScroll();
  const values = useTuschValues(scrollY.get() >= TUSCH_THRESHOLD);
  const clock = useMotionValue(0);
  const slotRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLElement | null>(null);
  const planRef = useRef<TuschPlan | null>(null);
  const previousRef = useRef(scrollY.get());
  const spentRef = useRef(false);
  const runningRef = useRef<AnimationPlaybackControls[]>([]);
  const [chrome, setChrome] = useState<HTMLElement | null>(null);
  const [staging, setStaging] = useState<TuschStaging | null>(null);

  const remeasure = (): TuschStaging | null => {
    const next = measureTusch(slotRef.current, copyRef.current, chromeRef.current);
    setStaging((current) => (sameStaging(current, next) ? current : next));

    return next;
  };

  const stopAll = (): void => {
    for (const running of runningRef.current) {
      running.stop();
    }

    runningRef.current = [];
    planRef.current = null;
    paintChrome(chromeRef.current, 1);
  };

  const strike = (scrollOffset: number): void => {
    stopAll();
    const measured = remeasure();

    if (measured === null) {
      values.restOpacity.set(0);
      values.titleOpacity.set(1);
      return;
    }

    const kind = spentRef.current ? 'quiet' : 'impact';
    const plan = planStrike(measured.geometry, scrollOffset, kind);
    const duration = strikeDurationOf(kind);
    spentRef.current = true;
    planRef.current = plan;
    applyFrame(values, strikeFrameAt(0, plan));
    runningRef.current = [animate(clock, [0, duration], { duration, ease: 'linear' })];

    if (kind === 'impact') {
      buzz(buzzPatternOf(contactOf(kind)));
    }
  };

  const release = (): void => {
    stopAll();
    buzz(0);
    values.copyOpacity.set(0);
    values.inkOpacity.set(0);
    values.flashOpacity.set(0);
    values.glow.set(0);
    values.restX.set(0);
    values.restRotate.set(0);
    values.restScale.set(1);
    values.restY.set(RETURN_FROM_Y);
    runningRef.current = [
      animate(values.titleOpacity, 0, LIFT_OFF),
      animate(values.titleScale, LIFT_OFF_SCALE, LIFT_OFF),
      animate(values.restOpacity, 1, RETURN),
      animate(values.restY, 0, RETURN),
    ];
  };

  const follow = (scrollOffset: number): void => {
    const crossing = crossingOf(previousRef.current, scrollOffset);
    previousRef.current = scrollOffset;

    if (crossing === 'down') {
      strike(scrollOffset);
    }

    if (crossing === 'up') {
      release();
    }
  };

  const play = (time: number): void => {
    const plan = planRef.current;

    if (plan === null) {
      return;
    }

    const frame = strikeFrameAt(time, plan);
    applyFrame(values, frame);
    paintChrome(chromeRef.current, frame.chromeScale);
  };

  useMotionValueEvent(scrollY, 'change', follow);
  useMotionValueEvent(clock, 'change', play);

  useLayoutEffect(() => {
    const host = slotRef.current?.closest(CHROME_SELECTOR) ?? null;
    chromeRef.current = host instanceof HTMLElement ? host : null;
    setChrome(chromeRef.current);

    return () => {
      paintChrome(chromeRef.current, 1);
    };
  }, []);

  const measureNow = useEffectEvent((): void => {
    remeasure();
  });

  useEffect(() => onRemeasure(measureNow), []);

  return { slotRef, copyRef, chrome, staging, values };
};
