import type { GesturePoint } from '@furria/studio/gesture-recogniser';
import {
  clampToBounds,
  momentumOf,
  momentumTargetOf,
  rubberFollow,
} from '@furria/studio/pan-bounds';
import type { AnimationPlaybackControls } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { TimelineView } from '../timeline-view';
import {
  fitView,
  followViewToSeconds,
  panBoundsOf,
  zoomedView,
  zoomLimitsOf,
} from '../timeline-view';

export interface TimelineNavigate {
  focal: GesturePoint;
  scale: number;
  dx: number;
}

export interface TimelineViewport {
  view: TimelineView;
  navigateStart: () => void;
  navigate: (move: TimelineNavigate) => void;
  navigateEnd: (velocityX: number) => void;
  follow: (seconds: number) => void;
  fit: () => void;
}

const FOLLOW_PAUSE_MS = 1800;
const FOLLOW_MARGIN_SHARE = 0.15;
const SETTLED_PX = 0.5;

export const useTimelineViewport = (length: number, width: number): TimelineViewport => {
  const [view, setView] = useState<TimelineView>(() => fitView(length, width));
  const [fittedWidth, setFittedWidth] = useState(width);
  const current = useRef(view);
  const raw = useRef(view.offsetPx);
  const navigating = useRef(false);
  const lastTouched = useRef(0);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const offset = useMotionValue(view.offsetPx);
  const reducedMotion = useReducedMotion() ?? false;

  if (fittedWidth !== width) {
    setFittedWidth(width);
    const fitted = fitView(length, width);
    current.current = fitted;
    setView(fitted);
  }

  const commit = (next: TimelineView): void => {
    current.current = next;
    setView(next);
  };

  useMotionValueEvent(offset, 'change', (latest) => {
    commit({ ...current.current, offsetPx: latest });
  });

  const stopGlide = (): void => {
    glide.current?.stop();
    glide.current = null;
  };

  useEffect(() => () => glide.current?.stop(), []);

  const place = (next: TimelineView, rubber: boolean): void => {
    const bounds = panBoundsOf(next, length, width);
    const shown = rubber
      ? rubberFollow(next.offsetPx, bounds, width)
      : clampToBounds(next.offsetPx, bounds);
    commit({ ...next, offsetPx: shown });
    offset.jump(shown);
  };

  return {
    view,
    navigateStart: () => {
      stopGlide();
      navigating.current = true;
      raw.current = current.current.offsetPx;
    },
    navigate: ({ focal, scale, dx }) => {
      stopGlide();
      lastTouched.current = performance.now();
      if (!navigating.current) {
        raw.current = current.current.offsetPx;
      }
      const zoomed = zoomedView(
        { pxPerSecond: current.current.pxPerSecond, offsetPx: raw.current },
        scale,
        focal.x,
        zoomLimitsOf(length, width),
      );
      raw.current = zoomed.offsetPx + dx;
      place({ ...zoomed, offsetPx: raw.current }, navigating.current);
    },
    navigateEnd: (velocityX) => {
      navigating.current = false;
      lastTouched.current = performance.now();
      const bounds = panBoundsOf(current.current, length, width);
      if (reducedMotion) {
        place(current.current, false);
        return;
      }
      const momentum = momentumOf(velocityX, bounds);
      glide.current = animate(offset, momentumTargetOf(offset.get(), momentum), {
        type: 'inertia',
        ...momentum,
        onComplete: () => {
          glide.current = null;
        },
      });
    },
    follow: (seconds) => {
      if (
        navigating.current ||
        glide.current !== null ||
        performance.now() - lastTouched.current < FOLLOW_PAUSE_MS
      ) {
        return;
      }
      const next = followViewToSeconds(
        current.current,
        seconds,
        width,
        width * FOLLOW_MARGIN_SHARE,
      );
      const settled = clampToBounds(next.offsetPx, panBoundsOf(next, length, width));
      if (width > 0 && Math.abs(settled - current.current.offsetPx) >= SETTLED_PX) {
        place(next, false);
      }
    },
    fit: () => {
      stopGlide();
      place(fitView(length, width), false);
    },
  };
};
