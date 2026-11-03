import type { MotionValue } from 'motion/react';
import { useMotionValue, useMotionValueEvent } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { GestureIntent, GesturePolicy } from '../gestures/gesture-recogniser';
import type { GestureHandlers } from '../gestures/use-gesture';
import { useGesture } from '../gestures/use-gesture';
import type { CentreView } from './centre-scrub';
import { centreViewOf } from './centre-scrub';
import type { BracketGrab, BracketGrip, BracketKey, BracketMove } from './overview-bracket';
import {
  bracketGrabOf,
  bracketGripOf,
  bracketMoveOf,
  bracketSharesOf,
  pannedCentreOf,
} from './overview-bracket';
import { secondsOfShare } from './timeline-geometry';
import type { CentreScrub } from './use-centre-scrub';

export interface OverviewBracket {
  areaRef: (node: HTMLElement | SVGElement | null) => void;
  handlers: GestureHandlers;
  from: MotionValue<number>;
  to: MotionValue<number>;
  grip: BracketGrip | null;
  view: CentreView;
  key: (key: BracketKey) => void;
}

const POLICY: GesturePolicy = {
  drag: true,
  navigate: false,
  longPress: false,
  precision: 'x',
};

const TEXT_REFRESH_MS = 150;

export const useOverviewBracket = (centre: CentreScrub, length: number): OverviewBracket => {
  const { x, scale, pxPerSecond, width } = centre;
  const from = useMotionValue(0);
  const to = useMotionValue(0);
  const grab = useRef<BracketGrab | null>(null);
  const textTimer = useRef<number | null>(null);
  const [grip, setGrip] = useState<BracketGrip | null>(null);
  const readView = (): CentreView =>
    centreViewOf(x.get(), pxPerSecond * scale.get(), width, length);
  const [view, setView] = useState<CentreView>(readView);

  const place = (): void => {
    const shares = bracketSharesOf(readView(), length);
    from.set(shares.from);
    to.set(shares.to);
  };

  const reader = useRef(readView);
  useLayoutEffect(() => {
    reader.current = readView;
  });

  const follow = (): void => {
    place();
    if (textTimer.current !== null) {
      return;
    }
    textTimer.current = window.setTimeout(() => {
      textTimer.current = null;
      setView(reader.current());
    }, TEXT_REFRESH_MS);
  };

  useMotionValueEvent(x, 'change', follow);
  useMotionValueEvent(scale, 'change', follow);
  useLayoutEffect(() => {
    const now = centreViewOf(x.get(), pxPerSecond * scale.get(), width, length);
    const shares = bracketSharesOf(now, length);
    from.set(shares.from);
    to.set(shares.to);
    if (textTimer.current === null) {
      textTimer.current = window.setTimeout(() => {
        textTimer.current = null;
        setView(reader.current());
      }, TEXT_REFRESH_MS);
    }
  }, [x, scale, pxPerSecond, width, length, from, to]);
  useEffect(
    () => () => {
      if (textTimer.current !== null) {
        window.clearTimeout(textTimer.current);
      }
    },
    [],
  );

  const onIntent = (intent: GestureIntent): void => {
    handleIntent(intent);
  };
  const gesture = useGesture({ policy: POLICY, onIntent });
  const areaWidth = gesture.areaSize?.width ?? 0;
  const secondsAt = (atX: number): number =>
    areaWidth > 0 ? secondsOfShare(atX / areaWidth, length) : 0;

  const steer = (move: BracketMove): void => {
    if (move.kind === 'frame') {
      centre.steerView(move.start, move.end);
      return;
    }
    centre.steerTo(move.seconds);
  };

  const handleIntent = (intent: GestureIntent): void => {
    switch (intent.kind) {
      case 'tap':
        centre.centreOn(secondsAt(intent.point.x));
        return;
      case 'dragStart': {
        const shares = { from: from.get(), to: to.get() };
        const grabbed = bracketGripOf(intent.origin.x, areaWidth, shares);
        grab.current = bracketGrabOf(grabbed, readView(), secondsAt(intent.origin.x));
        setGrip(grabbed);
        return;
      }
      case 'drag': {
        const held = grab.current;
        if (held !== null) {
          steer(bracketMoveOf(held, secondsAt(intent.value.x), length));
        }
        return;
      }
      case 'dragEnd':
      case 'dragCancel':
        grab.current = null;
        setGrip(null);
        centre.letGo();
        return;
      default:
        return;
    }
  };

  const keys: Record<BracketKey, () => void> = {
    earlier: () => {
      centre.centreOn(pannedCentreOf(readView(), -1, length));
    },
    later: () => {
      centre.centreOn(pannedCentreOf(readView(), 1, length));
    },
    closer: () => {
      centre.zoomBy(1);
    },
    wider: () => {
      centre.zoomBy(-1);
    },
  };

  return {
    areaRef: gesture.areaRef,
    handlers: gesture.handlers,
    from,
    to,
    grip,
    view,
    key: (key) => {
      keys[key]();
    },
  };
};
