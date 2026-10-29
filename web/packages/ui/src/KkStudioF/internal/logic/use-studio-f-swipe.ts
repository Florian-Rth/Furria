import type { PointerEvent, RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkStudioFTurn } from '../../studio-f-types';
import { STUDIO_F_EASE } from './studio-f-motion';
import { dragOffsetOf, swipeOutcomeOf } from './swipe-outcome';

const DRAG_SLOP = 8;
const ARRIVAL_SHIFT = 18;
const ARRIVAL_MS = 320;
const RETURN_MS = 220;

interface DragStart {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  width: number;
  moving: boolean;
}

export interface KkStudioFSwipeOptions {
  turn: KkStudioFTurn;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export interface KkStudioFSwipeHandlers {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
}

export interface KkStudioFSwipeControl {
  contentRef: RefObject<HTMLDivElement | null>;
  handlers: KkStudioFSwipeHandlers;
}

const startsOnControl = (target: EventTarget): boolean =>
  target instanceof Element && target.closest('button, a, [role="radio"]') !== null;

export const useStudioFSwipe = ({
  turn,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: KkStudioFSwipeOptions): KkStudioFSwipeControl => {
  const contentRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragStart | null>(null);
  const shownTurn = useRef(turn.key);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (shownTurn.current === turn.key || content === null) {
      return;
    }

    shownTurn.current = turn.key;
    content.style.transform = '';

    if (reduced) {
      return;
    }

    const shift = turn.direction === 'forward' ? ARRIVAL_SHIFT : -ARRIVAL_SHIFT;
    content.animate(
      [
        { transform: `translateX(${shift}%)`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: ARRIVAL_MS, easing: STUDIO_F_EASE },
    );
  }, [turn.key, turn.direction, reduced]);

  const settle = (): void => {
    const content = contentRef.current;

    if (content === null) {
      return;
    }

    const from = content.style.transform;
    content.style.transform = '';

    if (from !== '' && !reduced) {
      content.animate([{ transform: from }, { transform: 'translateX(0)' }], {
        duration: RETURN_MS,
        easing: STUDIO_F_EASE,
      });
    }
  };

  const release = (event: PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const start = drag.current;

    if (start === null || start.pointerId !== event.pointerId) {
      return;
    }

    drag.current = null;

    if (!start.moving) {
      return;
    }

    const outcome = cancelled
      ? 'stay'
      : swipeOutcomeOf({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
          width: start.width,
          milliseconds: event.timeStamp - start.time,
        });

    if (outcome === 'next' && canNext) {
      onNext();
      return;
    }

    if (outcome === 'previous' && canPrevious) {
      onPrevious();
      return;
    }

    settle();
  };

  return {
    contentRef,
    handlers: {
      onPointerDown: (event) => {
        if (event.button !== 0 || startsOnControl(event.target)) {
          return;
        }

        drag.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
          width: event.currentTarget.clientWidth,
          moving: false,
        };
      },
      onPointerMove: (event) => {
        const start = drag.current;
        const content = contentRef.current;

        if (start === null || start.pointerId !== event.pointerId || content === null) {
          return;
        }

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;

        if (!start.moving) {
          if (Math.abs(dx) < DRAG_SLOP || Math.abs(dx) < Math.abs(dy)) {
            return;
          }
          start.moving = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }

        content.style.transform = `translateX(${dragOffsetOf(dx, canPrevious, canNext)}px)`;
      },
      onPointerUp: (event) => {
        release(event, false);
      },
      onPointerCancel: (event) => {
        release(event, true);
      },
    },
  };
};
