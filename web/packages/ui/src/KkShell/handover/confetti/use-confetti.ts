import { animate, useMotionValueEvent } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { kkTokens } from '../../../tokens';
import { useKkShellScroll } from '../../internal/logic/shell-scroll';
import { DOCK_REPLAY_EVENT } from './confetti-dock-context';
import type { DockGeometry } from './dock-flight';
import { DOCK_TRAVEL, dockFlightAt, dockProgressAt, dockStageAt, landingDue } from './dock-flight';
import { DOCK_HEADER_SELECTOR, dockHeadlineTextOf, measureDock } from './measure-dock';
import type { DockValues } from './use-dock-values';
import { useDockValues } from './use-dock-values';

const { headerDrift } = kkTokens.shell;

const SQUASH_SECONDS = 0.46;
const SQUASH_Y = [1, 0.78, 1.1, 0.97, 1];
const SQUASH_X = [1, 1.1, 0.96, 1.01, 1];
const HEADLINE_CHANGES: MutationObserverInit = {
  characterData: true,
  childList: true,
  subtree: true,
};

export interface Confetti {
  slotRef: RefObject<HTMLDivElement | null>;
  geometry: DockGeometry | null;
  landingKey: number;
  values: DockValues;
}

export const useConfetti = (): Confetti => {
  const { scrollY } = useKkShellScroll();
  const values = useDockValues();
  const slotRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<DockGeometry | null>(null);
  const previousRef = useRef(0);
  const landedRef = useRef(false);
  const headlineTextRef = useRef<string | null>(null);
  const [geometry, setGeometry] = useState<DockGeometry | null>(null);
  const [landingKey, setLandingKey] = useState(0);

  const remeasure = (): void => {
    geometryRef.current = measureDock(slotRef.current);
    setGeometry(geometryRef.current);
  };

  const land = (): void => {
    landedRef.current = true;
    setLandingKey(Date.now());
    void animate(values.titleScaleY, SQUASH_Y, { duration: SQUASH_SECONDS, ease: 'easeOut' });
    void animate(values.titleScaleX, SQUASH_X, { duration: SQUASH_SECONDS, ease: 'easeOut' });
  };

  const follow = (scrollOffset: number): void => {
    const progress = dockProgressAt(scrollOffset, DOCK_TRAVEL);

    if (progress > 0 && (geometryRef.current === null || previousRef.current <= 0)) {
      remeasure();
    }

    const current = geometryRef.current;
    const headline = current?.headline ?? null;
    const stage = dockStageAt(progress, headline !== null, headerDrift);

    values.flightOpacity.set(stage.flightOpacity);
    values.restOpacity.set(stage.restOpacity);
    values.restX.set(stage.restShiftX);
    values.restY.set(stage.restShiftY);
    values.titleOpacity.set(stage.titleOpacity);

    if (current !== null && headline !== null) {
      const flight = dockFlightAt(scrollOffset, headline.box, current.slot, DOCK_TRAVEL);
      values.headlineX.set(flight.x);
      values.headlineY.set(flight.y);
      values.headlineScale.set(flight.scale);
    }

    if (current !== null && landingDue(previousRef.current, progress, landedRef.current)) {
      land();
    }

    previousRef.current = progress;
  };

  const settle = useEffectEvent((): void => {
    previousRef.current = dockProgressAt(scrollY.get(), DOCK_TRAVEL);
    follow(scrollY.get());
  });

  const refresh = useEffectEvent((): void => {
    geometryRef.current = null;
    follow(scrollY.get());
  });

  const replayLanding = useEffectEvent((): void => {
    if (geometryRef.current === null) {
      remeasure();
    }

    land();
  });

  const followHeadline = useEffectEvent((): void => {
    const text = dockHeadlineTextOf();

    if (text !== headlineTextRef.current) {
      headlineTextRef.current = text;
      refresh();
    }
  });

  useMotionValueEvent(scrollY, 'change', follow);

  useEffect(() => {
    let alive = true;
    const slot = slotRef.current;
    const header = document.querySelector(DOCK_HEADER_SELECTOR);
    const headlineWatch = new MutationObserver(() => {
      followHeadline();
    });

    const onResize = (): void => {
      refresh();
    };

    const onReplay = (): void => {
      replayLanding();
    };

    headlineTextRef.current = dockHeadlineTextOf();
    settle();
    window.addEventListener('resize', onResize);
    slot?.addEventListener(DOCK_REPLAY_EVENT, onReplay);

    if (header !== null) {
      headlineWatch.observe(header, HEADLINE_CHANGES);
    }

    void document.fonts.ready.then(() => {
      if (alive) {
        refresh();
      }
    });

    return () => {
      alive = false;
      headlineWatch.disconnect();
      window.removeEventListener('resize', onResize);
      slot?.removeEventListener(DOCK_REPLAY_EVENT, onReplay);
    };
  }, []);

  return { slotRef, geometry, landingKey, values };
};
