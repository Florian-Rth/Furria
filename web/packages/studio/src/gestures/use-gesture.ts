import type { PointerEvent } from 'react';
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import type {
  GestureInput,
  GestureIntent,
  GesturePointerKind,
  GesturePolicy,
  GestureState,
  GestureWheelUnit,
} from './gesture-recogniser';
import {
  initialGesture,
  isGestureActive,
  longPressDeadlineOf,
  stepGesture,
  wheelPixelsOf,
} from './gesture-recogniser';
import type { LiftSize } from './lift-placement';
import { useWorkArea } from './use-work-area';

type GestureElement = HTMLElement | SVGElement;

export interface GestureHandlers {
  onPointerDown: (event: PointerEvent<GestureElement>) => void;
  onPointerMove: (event: PointerEvent<GestureElement>) => void;
  onPointerUp: (event: PointerEvent<GestureElement>) => void;
  onPointerCancel: (event: PointerEvent<GestureElement>) => void;
  onLostPointerCapture: (event: PointerEvent<GestureElement>) => void;
}

export interface Gesture {
  areaRef: (node: GestureElement | null) => void;
  handlers: GestureHandlers;
  areaSize: LiftSize | null;
  isActive: () => boolean;
}

interface UseGestureOptions {
  policy: GesturePolicy;
  onIntent: (intent: GestureIntent) => void;
}

interface GestureCallbacks {
  policy: GesturePolicy;
  onIntent: (intent: GestureIntent) => void;
}

interface AreaOrigin {
  left: number;
  top: number;
}

const IGNORED_TARGETS = 'input, select, textarea, [data-gesture-ignore]';
const WHEEL_UNITS: readonly GestureWheelUnit[] = ['pixel', 'line', 'page'];

const CAPTURING_INTENTS: ReadonlySet<GestureIntent['kind']> = new Set([
  'dragStart',
  'longPress',
  'navigateStart',
]);

const pointerKindOf = (pointerType: string): GesturePointerKind =>
  pointerType === 'mouse' || pointerType === 'pen' ? pointerType : 'touch';

const isIgnoredTarget = (target: EventTarget): boolean =>
  target instanceof Element && target.closest(IGNORED_TARGETS) !== null;

const scaleOf = (event: Event): number | null =>
  'scale' in event && typeof event.scale === 'number' ? event.scale : null;

const clientPointOf = (event: Event): { clientX: number; clientY: number } | null =>
  'clientX' in event &&
  'clientY' in event &&
  typeof event.clientX === 'number' &&
  typeof event.clientY === 'number'
    ? { clientX: event.clientX, clientY: event.clientY }
    : null;

const capture = (node: GestureElement, pointerId: number): void => {
  try {
    node.setPointerCapture(pointerId);
  } catch {
    return;
  }
};

export const useGesture = ({ policy, onIntent }: UseGestureOptions): Gesture => {
  const machine = useRef<GestureState>(initialGesture());
  const callbacks = useRef<GestureCallbacks>({ policy, onIntent });
  const longPressTimer = useRef<number | null>(null);
  const scheduledDeadline = useRef<number | null>(null);
  const areaOrigin = useRef<AreaOrigin>({ left: 0, top: 0 });
  const safariScale = useRef(1);
  const [node, setNode] = useState<GestureElement | null>(null);
  const [areaSize, setAreaSize] = useState<LiftSize | null>(null);
  useWorkArea(node);

  useLayoutEffect(() => {
    callbacks.current = { policy, onIntent };
  });

  const localOf = (clientX: number, clientY: number): { x: number; y: number } => ({
    x: clientX - areaOrigin.current.left,
    y: clientY - areaOrigin.current.top,
  });

  const measureOrigin = (): void => {
    const box = node?.getBoundingClientRect();
    areaOrigin.current = { left: box?.left ?? 0, top: box?.top ?? 0 };
  };

  const clearLongPress = (): void => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
    }
    longPressTimer.current = null;
    scheduledDeadline.current = null;
  };

  const captureTracked = (intents: readonly GestureIntent[]): void => {
    if (node === null || !intents.some((intent) => CAPTURING_INTENTS.has(intent.kind))) {
      return;
    }
    for (const pointer of machine.current.pointers) {
      capture(node, pointer.id);
    }
  };

  const dispatch = (input: GestureInput): void => {
    const step = stepGesture(machine.current, input, callbacks.current.policy);
    machine.current = step.state;
    const deadline = longPressDeadlineOf(step.state);
    if (deadline !== scheduledDeadline.current) {
      clearLongPress();
      if (deadline !== null) {
        scheduledDeadline.current = deadline;
        longPressTimer.current = window.setTimeout(
          () => dispatch({ type: 'tick', t: deadline }),
          Math.max(deadline - performance.now(), 0),
        );
      }
    }
    captureTracked(step.intents);
    for (const intent of step.intents) {
      callbacks.current.onIntent(intent);
    }
  };

  const onPointerDown = (event: PointerEvent<GestureElement>): void => {
    if ((event.pointerType === 'mouse' && event.button !== 0) || isIgnoredTarget(event.target)) {
      return;
    }
    if (!isGestureActive(machine.current)) {
      measureOrigin();
    }
    dispatch({
      type: 'down',
      id: event.pointerId,
      ...localOf(event.clientX, event.clientY),
      t: event.timeStamp,
      kind: pointerKindOf(event.pointerType),
    });
  };

  const onPointerMove = (event: PointerEvent<GestureElement>): void => {
    if (!isGestureActive(machine.current)) {
      return;
    }
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      dispatch({ type: 'cancel', id: event.pointerId });
      return;
    }
    dispatch({
      type: 'move',
      id: event.pointerId,
      ...localOf(event.clientX, event.clientY),
      t: event.timeStamp,
    });
  };

  const onPointerUp = (event: PointerEvent<GestureElement>): void => {
    dispatch({
      type: 'up',
      id: event.pointerId,
      ...localOf(event.clientX, event.clientY),
      t: event.timeStamp,
    });
  };

  const onPointerCancel = (event: PointerEvent<GestureElement>): void => {
    dispatch({ type: 'cancel', id: event.pointerId });
  };

  const onWheel = useEffectEvent((event: WheelEvent): void => {
    if (!callbacks.current.policy.navigate) {
      return;
    }
    event.preventDefault();
    measureOrigin();
    const unit = WHEEL_UNITS[event.deltaMode] ?? 'pixel';
    const pageSize = node?.clientHeight ?? 0;
    dispatch({
      type: 'wheel',
      dx: wheelPixelsOf(event.deltaX, unit, pageSize),
      dy: wheelPixelsOf(event.deltaY, unit, pageSize),
      ...localOf(event.clientX, event.clientY),
      zoom: event.ctrlKey || event.metaKey,
    });
  });

  const onSafariGestureStart = useEffectEvent((event: Event): void => {
    if (!callbacks.current.policy.navigate) {
      return;
    }
    event.preventDefault();
    measureOrigin();
    safariScale.current = scaleOf(event) ?? 1;
  });

  const onSafariGestureChange = useEffectEvent((event: Event): void => {
    if (!callbacks.current.policy.navigate) {
      return;
    }
    event.preventDefault();
    const next = scaleOf(event);
    const point = clientPointOf(event);
    if (next === null || point === null || safariScale.current <= 0) {
      return;
    }
    const ratio = next / safariScale.current;
    safariScale.current = next;
    dispatch({ type: 'scale', ratio, ...localOf(point.clientX, point.clientY) });
  });

  const onAreaGone = useEffectEvent((): void => {
    clearLongPress();
    machine.current = initialGesture();
  });

  useEffect(() => {
    if (node === null) {
      return;
    }
    const wheel = (event: Event): void => {
      if (event instanceof WheelEvent) {
        onWheel(event);
      }
    };
    const gestureStart = (event: Event): void => onSafariGestureStart(event);
    const gestureChange = (event: Event): void => onSafariGestureChange(event);
    const observer = new ResizeObserver((entries) => {
      const border = entries[0]?.borderBoxSize[0];
      if (border !== undefined) {
        setAreaSize({ width: border.inlineSize, height: border.blockSize });
      }
    });
    observer.observe(node);
    node.addEventListener('wheel', wheel, { passive: false });
    node.addEventListener('gesturestart', gestureStart);
    node.addEventListener('gesturechange', gestureChange);

    return () => {
      observer.disconnect();
      node.removeEventListener('wheel', wheel);
      node.removeEventListener('gesturestart', gestureStart);
      node.removeEventListener('gesturechange', gestureChange);
      onAreaGone();
    };
  }, [node]);

  return {
    areaRef: setNode,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
    },
    areaSize,
    isActive: () => isGestureActive(machine.current),
  };
};
