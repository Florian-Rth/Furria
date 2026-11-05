import type { KkPlanPointerEvent } from '@furria/ui/KkFloorPlan';
import { useLayoutEffect, useRef, useState } from 'react';
import type { TouchTap, TouchTarget } from './plan-touch';
import {
  dragIntentOf,
  HANDLE_LIFT_PX,
  isBeyondSlop,
  isDoubleTap,
  isLiftableHandle,
  LONG_PRESS_MS,
  longPressIntentOf,
} from './plan-touch';
import type { Point } from './schemas';

const LONG_PRESS_VIBRATION_MS = 12;
const MOUSE = 'mouse';
const PRIMARY_BUTTON = 0;

export type TouchStyle = 'off' | 'tap' | 'polyline';

export interface PlanPointerHandlers {
  down: (event: KkPlanPointerEvent) => void;
  move: (event: KkPlanPointerEvent) => void;
  up: (event: KkPlanPointerEvent) => void;
  cancel: (event: KkPlanPointerEvent) => void;
}

export interface TouchGestureInput {
  style: TouchStyle;
  canSelect: boolean;
  scale: number;
  targetOf: (event: KkPlanPointerEvent) => TouchTarget;
  forward: PlanPointerHandlers;
  panBy: (deltaXPx: number, deltaYPx: number) => void;
  zoomTo: (target: TouchTarget) => void;
}

export interface TouchGestures extends PlanPointerHandlers {
  loupe: Point | null;
}

type Press =
  | { mode: 'idle' }
  | {
      mode: 'pending';
      start: KkPlanPointerEvent;
      target: TouchTarget;
      timer: ReturnType<typeof setTimeout> | null;
    }
  | { mode: 'pan'; last: Point }
  | { mode: 'forward'; lift: boolean }
  | { mode: 'held' }
  | { mode: 'polyline' };

const IDLE: Press = { mode: 'idle' };

const asPrimary = (
  event: KkPlanPointerEvent,
  shiftKey = false,
  targetId: string | null = event.targetId,
): KkPlanPointerEvent => ({
  ...event,
  pointerType: MOUSE,
  button: PRIMARY_BUTTON,
  buttons: 1,
  shiftKey,
  targetId,
});

const lifted = (event: KkPlanPointerEvent, scale: number): KkPlanPointerEvent => ({
  ...event,
  y: event.y - HANDLE_LIFT_PX / scale,
  screenY: event.screenY - HANDLE_LIFT_PX,
});

const screenOf = (event: KkPlanPointerEvent): Point => ({ x: event.screenX, y: event.screenY });

const vibrate = (): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(LONG_PRESS_VIBRATION_MS);
  }
};

export const useTouchGestures = (input: TouchGestureInput): TouchGestures => {
  const latest = useRef(input);
  const press = useRef<Press>(IDLE);
  const lastTap = useRef<TouchTap | null>(null);
  const [loupe, setLoupe] = useState<Point | null>(null);

  useLayoutEffect(() => {
    latest.current = input;
  });

  const afterRender = (run: (current: TouchGestureInput) => void): void => {
    setTimeout(() => {
      run(latest.current);
    }, 0);
  };

  const clearTimer = (): void => {
    const current = press.current;
    if (current.mode === 'pending' && current.timer !== null) {
      clearTimeout(current.timer);
    }
  };

  const tap = (start: KkPlanPointerEvent, end: KkPlanPointerEvent, target: TouchTarget): void => {
    const now: TouchTap = { at: screenOf(end), time: Date.now() };
    if (input.canSelect && isDoubleTap(lastTap.current, now)) {
      lastTap.current = null;
      input.zoomTo(target);
      return;
    }
    lastTap.current = now;
    input.forward.down(asPrimary(start, false, target.id ?? start.targetId));
    afterRender((current) => {
      current.forward.up(asPrimary(end, false, target.id ?? end.targetId));
    });
  };

  const holdLong = (): void => {
    const current = press.current;
    if (current.mode !== 'pending') {
      return;
    }
    const intent = longPressIntentOf(current.target.kind);
    if (intent === null) {
      return;
    }
    vibrate();
    const forward = latest.current.forward;
    if (intent === 'toggle') {
      press.current = { mode: 'held' };
      forward.down(asPrimary(current.start, true, current.target.id));
      afterRender((fresh) => {
        fresh.forward.up(asPrimary(current.start, true, current.target.id));
      });
      return;
    }
    press.current = { mode: 'forward', lift: false };
    forward.down(asPrimary(current.start));
  };

  const down = (event: KkPlanPointerEvent): void => {
    clearTimer();
    if (input.style === 'off') {
      input.forward.down(event);
      return;
    }
    if (input.style === 'polyline') {
      press.current = { mode: 'polyline' };
      input.forward.move(event);
      return;
    }
    const target = input.targetOf(event);
    if (target.kind === 'handle') {
      const lift = isLiftableHandle(event.handleId);
      const pressed = lift ? lifted(event, input.scale) : event;
      press.current = { mode: 'forward', lift };
      setLoupe(lift ? { x: pressed.x, y: pressed.y } : null);
      input.forward.down(asPrimary(pressed));
      return;
    }
    const timer = input.canSelect ? setTimeout(holdLong, LONG_PRESS_MS) : null;
    press.current = { mode: 'pending', start: event, target, timer };
  };

  const move = (event: KkPlanPointerEvent): void => {
    const current = press.current;
    switch (current.mode) {
      case 'idle':
        if (input.style === 'off') {
          input.forward.move(event);
        }
        return;
      case 'pending': {
        if (!isBeyondSlop(screenOf(current.start), screenOf(event))) {
          return;
        }
        clearTimer();
        if (dragIntentOf(current.target.kind) === 'move' && input.canSelect) {
          press.current = { mode: 'forward', lift: false };
          input.forward.down(asPrimary(current.start, false, current.target.id));
          afterRender((fresh) => {
            fresh.forward.move(asPrimary(event));
          });
          return;
        }
        press.current = { mode: 'pan', last: screenOf(event) };
        input.panBy(event.screenX - current.start.screenX, event.screenY - current.start.screenY);
        return;
      }
      case 'pan':
        input.panBy(event.screenX - current.last.x, event.screenY - current.last.y);
        press.current = { mode: 'pan', last: screenOf(event) };
        return;
      case 'forward': {
        const moved = current.lift ? lifted(event, input.scale) : event;
        if (current.lift) {
          setLoupe({ x: moved.x, y: moved.y });
        }
        input.forward.move(asPrimary(moved));
        return;
      }
      case 'polyline':
        input.forward.move(event);
        return;
      case 'held':
        return;
    }
  };

  const up = (event: KkPlanPointerEvent): void => {
    const current = press.current;
    clearTimer();
    press.current = IDLE;
    switch (current.mode) {
      case 'idle':
        if (input.style === 'off') {
          input.forward.up(event);
        }
        return;
      case 'pending':
        tap(current.start, event, current.target);
        return;
      case 'forward':
        setLoupe(null);
        input.forward.up(asPrimary(current.lift ? lifted(event, input.scale) : event));
        return;
      case 'polyline':
        input.forward.down(asPrimary(event));
        return;
      case 'pan':
      case 'held':
        return;
    }
  };

  const cancel = (event: KkPlanPointerEvent): void => {
    const current = press.current;
    clearTimer();
    press.current = IDLE;
    setLoupe(null);
    if (current.mode === 'forward' || current.mode === 'polyline' || input.style === 'off') {
      input.forward.cancel(event);
    }
  };

  return { loupe, down, move, up, cancel };
};
