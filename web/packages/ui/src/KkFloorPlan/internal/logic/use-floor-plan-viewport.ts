import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, Ref } from 'react';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type {
  KkPlanBounds,
  KkPlanPinch,
  KkPlanPoint,
  KkPlanView,
  KkPlanViewportSize,
} from '../../floor-plan-view';
import {
  DEFAULT_PLAN_VIEW,
  fitPlanView,
  panPlanBy,
  pinchPlanView,
  planDistance,
  planMidpoint,
  screenToPlan,
  wheelZoomFactor,
  zoomPlanAbout,
} from '../../floor-plan-view';
import { PLAN_HANDLE_ATTRIBUTE, PLAN_HIT_ATTRIBUTE } from '../floor-plan-paint';

export interface KkPlanPointerEvent {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  targetId: string | null;
  handleId: string | null;
  button: number;
  buttons: number;
  shiftKey: boolean;
  altKey: boolean;
  modKey: boolean;
  pointerType: string;
  pointerId: number;
}

export interface KkFloorPlanHandle {
  fit: (bounds: KkPlanBounds, paddingPx?: number) => void;
  zoomBy: (factor: number) => void;
  view: () => KkPlanView;
}

export interface FloorPlanViewportOptions {
  view: KkPlanView | undefined;
  defaultView: KkPlanView | undefined;
  onViewChange: ((view: KkPlanView) => void) | undefined;
  panning: boolean;
  onPlanPointerDown: ((event: KkPlanPointerEvent) => void) | undefined;
  onPlanPointerMove: ((event: KkPlanPointerEvent) => void) | undefined;
  onPlanPointerUp: ((event: KkPlanPointerEvent) => void) | undefined;
  onPlanPointerCancel: ((event: KkPlanPointerEvent) => void) | undefined;
  onPlanDoubleClick: ((event: KkPlanPointerEvent) => void) | undefined;
  onViewportResize: ((size: KkPlanViewportSize) => void) | undefined;
  handle: Ref<KkFloorPlanHandle> | undefined;
}

type GestureMode = 'idle' | 'plan' | 'pan' | 'pinch';

interface Gesture {
  mode: GestureMode;
  pointers: Map<number, KkPlanPoint>;
  last: KkPlanPoint | null;
  pinch: KkPlanPinch | null;
}

interface PlanPointerSource {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
  button: number;
  buttons: number;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  pointerType: string;
  pointerId: number;
}

const MIDDLE_BUTTON = 1;
const PINCH_POINTERS = 2;
const PINCH_WHEEL_BOOST = 8;

const attributeOf = (target: EventTarget | null, attribute: string): string | null => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(`[${attribute}]`)?.getAttribute(attribute) ?? null;
};

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const firstTwo = (pointers: Map<number, KkPlanPoint>): [KkPlanPoint, KkPlanPoint] | null => {
  const [first, second] = [...pointers.values()];

  return first === undefined || second === undefined ? null : [first, second];
};

export interface FloorPlanViewport {
  view: KkPlanView;
  size: KkPlanViewportSize;
  isPanReady: boolean;
  isPanning: boolean;
  measure: (node: HTMLDivElement | null) => void;
  pointerDown: (event: ReactPointerEvent<SVGSVGElement>) => void;
  pointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
  pointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
  pointerCancel: (event: ReactPointerEvent<SVGSVGElement>) => void;
  doubleClick: (event: ReactMouseEvent<SVGSVGElement>) => void;
}

export const useFloorPlanViewport = (options: FloorPlanViewportOptions): FloorPlanViewport => {
  const [ownView, setOwnView] = useState<KkPlanView>(options.defaultView ?? DEFAULT_PLAN_VIEW);
  const [size, setSize] = useState<KkPlanViewportSize>({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isSpaceHeld, setSpaceHeld] = useState(false);
  const [isPanning, setPanning] = useState(false);
  const gesture = useRef<Gesture>({ mode: 'idle', pointers: new Map(), last: null, pinch: null });
  const pendingFit = useRef<{ bounds: KkPlanBounds; paddingPx: number | undefined } | null>(null);
  const view = options.view ?? ownView;
  const latest = useRef({ view, size, options });

  useLayoutEffect(() => {
    latest.current = { view, size, options };
  });

  const changeView = (next: KkPlanView): void => {
    if (latest.current.options.view === undefined) {
      setOwnView(next);
    }
    latest.current.view = next;
    latest.current.options.onViewChange?.(next);
  };

  const fit = (bounds: KkPlanBounds, paddingPx?: number): void => {
    const current = latest.current.size;
    if (current.width === 0 || current.height === 0) {
      pendingFit.current = { bounds, paddingPx };
      return;
    }
    changeView(fitPlanView(bounds, current, paddingPx));
  };

  useImperativeHandle(options.handle, () => ({
    fit,
    zoomBy: (factor: number): void => {
      const current = latest.current.size;
      const centre = { x: current.width / 2, y: current.height / 2 };
      changeView(zoomPlanAbout(latest.current.view, current, centre, factor));
    },
    view: (): KkPlanView => latest.current.view,
  }));

  useEffect(() => {
    if (node === null) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      latest.current.size = next;
      setSize(next);
      latest.current.options.onViewportResize?.(next);
      const waiting = pendingFit.current;
      if (waiting !== null && next.width > 0 && next.height > 0) {
        pendingFit.current = null;
        changeView(fitPlanView(waiting.bounds, next, waiting.paddingPx));
      }
    });
    observer.observe(node);
    const wheel = (event: WheelEvent): void => {
      event.preventDefault();
      const box = node.getBoundingClientRect();
      const delta = event.ctrlKey ? event.deltaY * PINCH_WHEEL_BOOST : event.deltaY;
      const pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      changeView(
        zoomPlanAbout(latest.current.view, latest.current.size, pointer, wheelZoomFactor(delta)),
      );
    };
    node.addEventListener('wheel', wheel, { passive: false });

    return () => {
      observer.disconnect();
      node.removeEventListener('wheel', wheel);
    };
  }, [node]);

  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      if (event.code === 'Space' && !isTypingTarget(event.target)) {
        event.preventDefault();
        setSpaceHeld(true);
      }
    };
    const release = (event: KeyboardEvent): void => {
      if (event.code === 'Space') {
        setSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', press);
    window.addEventListener('keyup', release);

    return () => {
      window.removeEventListener('keydown', press);
      window.removeEventListener('keyup', release);
    };
  }, []);

  const screenOf = (source: PlanPointerSource): KkPlanPoint => {
    const box = node?.getBoundingClientRect();

    return { x: source.clientX - (box?.left ?? 0), y: source.clientY - (box?.top ?? 0) };
  };

  const planEventOf = (source: PlanPointerSource): KkPlanPointerEvent => {
    const screen = screenOf(source);
    const plan = screenToPlan(latest.current.view, latest.current.size, screen);

    return {
      x: plan.x,
      y: plan.y,
      screenX: screen.x,
      screenY: screen.y,
      targetId: attributeOf(source.target, PLAN_HIT_ATTRIBUTE),
      handleId: attributeOf(source.target, PLAN_HANDLE_ATTRIBUTE),
      button: source.button,
      buttons: source.buttons,
      shiftKey: source.shiftKey,
      altKey: source.altKey,
      modKey: source.ctrlKey || source.metaKey,
      pointerType: source.pointerType,
      pointerId: source.pointerId,
    };
  };

  const startPinch = (): void => {
    const pair = firstTwo(gesture.current.pointers);
    if (pair === null) {
      return;
    }
    gesture.current.pinch = {
      view: latest.current.view,
      midpoint: planMidpoint(pair[0], pair[1]),
      distance: planDistance(pair[0], pair[1]),
    };
  };

  const pointerDown = (event: ReactPointerEvent<SVGSVGElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = gesture.current;
    const screen = screenOf(event);
    current.pointers.set(event.pointerId, screen);
    if (current.pointers.size === PINCH_POINTERS) {
      if (current.mode === 'plan') {
        latest.current.options.onPlanPointerCancel?.(planEventOf(event));
      }
      current.mode = 'pinch';
      startPinch();
      return;
    }
    if (current.pointers.size > PINCH_POINTERS) {
      return;
    }
    const wantsPan =
      event.button === MIDDLE_BUTTON || isSpaceHeld || latest.current.options.panning;
    if (wantsPan) {
      current.mode = 'pan';
      current.last = screen;
      setPanning(true);
      return;
    }
    current.mode = 'plan';
    latest.current.options.onPlanPointerDown?.(planEventOf(event));
  };

  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>): void => {
    const current = gesture.current;
    const screen = screenOf(event);
    if (current.pointers.has(event.pointerId)) {
      current.pointers.set(event.pointerId, screen);
    }
    if (current.mode === 'pinch') {
      const pair = firstTwo(current.pointers);
      if (pair !== null && current.pinch !== null) {
        changeView(
          pinchPlanView(
            current.pinch,
            latest.current.size,
            planMidpoint(pair[0], pair[1]),
            planDistance(pair[0], pair[1]),
          ),
        );
      }
      return;
    }
    if (current.mode === 'pan') {
      const last = current.last ?? screen;
      current.last = screen;
      changeView(panPlanBy(latest.current.view, screen.x - last.x, screen.y - last.y));
      return;
    }
    latest.current.options.onPlanPointerMove?.(planEventOf(event));
  };

  const release = (
    event: ReactPointerEvent<SVGSVGElement>,
    report: ((plan: KkPlanPointerEvent) => void) | undefined,
  ): void => {
    const current = gesture.current;
    current.pointers.delete(event.pointerId);
    if (current.mode === 'plan') {
      report?.(planEventOf(event));
    }
    if (current.pointers.size === 0) {
      current.mode = 'idle';
      current.last = null;
      current.pinch = null;
      setPanning(false);
    }
  };

  const pointerUp = (event: ReactPointerEvent<SVGSVGElement>): void => {
    release(event, latest.current.options.onPlanPointerUp);
  };

  const pointerCancel = (event: ReactPointerEvent<SVGSVGElement>): void => {
    release(event, latest.current.options.onPlanPointerCancel);
  };

  const doubleClick = (event: ReactMouseEvent<SVGSVGElement>): void => {
    latest.current.options.onPlanDoubleClick?.(
      planEventOf({
        clientX: event.clientX,
        clientY: event.clientY,
        target: event.target,
        button: event.button,
        buttons: event.buttons,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        pointerType: 'mouse',
        pointerId: 0,
      }),
    );
  };

  return {
    view,
    size,
    isPanReady: isSpaceHeld || options.panning,
    isPanning,
    measure: setNode,
    pointerDown,
    pointerMove,
    pointerUp,
    pointerCancel,
    doubleClick,
  };
};
