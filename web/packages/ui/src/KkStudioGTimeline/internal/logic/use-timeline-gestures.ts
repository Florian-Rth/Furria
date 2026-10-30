import type { PointerEvent, PointerEventHandler, RefObject } from 'react';
import { useEffect, useRef } from 'react';

const SCRUB_THRESHOLD_PX = 6;
const WHEEL_ZOOM_RATE = 0.0025;

export type KkStudioGScrubPhase = 'start' | 'move' | 'end';

export interface KkStudioGTimelineGestures {
  onScrub: (phase: KkStudioGScrubPhase, deltaPx: number) => void;
  onZoom: (factor: number) => void;
  onWheel: (deltaPx: number) => void;
}

export interface KkStudioGTimelineSurface {
  ref: RefObject<HTMLDivElement | null>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

interface Touch {
  x: number;
  y: number;
}

interface Gesture {
  startX: number;
  scrubbing: boolean;
  pinchDistance: number | null;
}

const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  window.setTimeout(() => {
    window.removeEventListener('click', swallow, { capture: true });
  }, 0);
};

const distanceOf = (touches: ReadonlyMap<number, Touch>): number | null => {
  const [first, second] = [...touches.values()];

  return first === undefined || second === undefined
    ? null
    : Math.hypot(first.x - second.x, first.y - second.y);
};

export const useTimelineGestures = (
  gestures: KkStudioGTimelineGestures,
): KkStudioGTimelineSurface => {
  const ref = useRef<HTMLDivElement>(null);
  const touches = useRef(new Map<number, Touch>());
  const gesture = useRef<Gesture | null>(null);
  const latest = useRef(gestures);

  useEffect(() => {
    latest.current = gestures;
  });

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        latest.current.onZoom(Math.exp(-event.deltaY * WHEEL_ZOOM_RATE));
        return;
      }
      latest.current.onWheel(event.deltaX === 0 ? event.deltaY : event.deltaX);
    };
    element.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, []);

  const release = (event: PointerEvent<HTMLDivElement>): void => {
    touches.current.delete(event.pointerId);
    const current = gesture.current;
    if (current === null) {
      return;
    }
    if (current.scrubbing) {
      latest.current.onScrub('end', event.clientX - current.startX);
      swallowNextClick();
    }
    gesture.current = touches.current.size === 0 ? null : { ...current, scrubbing: false };
  };

  return {
    ref,
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return;
      }
      touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.current.size === 1) {
        gesture.current = { startX: event.clientX, scrubbing: false, pinchDistance: null };
        return;
      }
      const current = gesture.current;
      if (current?.scrubbing === true) {
        latest.current.onScrub('end', event.clientX - current.startX);
      }
      gesture.current = {
        startX: event.clientX,
        scrubbing: false,
        pinchDistance: distanceOf(touches.current),
      };
    },
    onPointerMove: (event) => {
      const current = gesture.current;
      if (current === null || !touches.current.has(event.pointerId)) {
        return;
      }
      touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (current.pinchDistance !== null) {
        const distance = distanceOf(touches.current);
        if (distance !== null && current.pinchDistance > 0) {
          latest.current.onZoom(distance / current.pinchDistance);
          current.pinchDistance = distance;
        }
        return;
      }
      const delta = event.clientX - current.startX;
      if (!current.scrubbing && Math.abs(delta) < SCRUB_THRESHOLD_PX) {
        return;
      }
      if (!current.scrubbing) {
        current.scrubbing = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        latest.current.onScrub('start', 0);
      }
      latest.current.onScrub('move', delta);
    },
    onPointerUp: release,
    onPointerCancel: release,
  };
};
