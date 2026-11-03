import { useLayoutEffect, useRef, useState } from 'react';
import type { StageFrame } from '../stage/stage-framing';
import { WHOLE_STAGE_FRAME } from '../stage/stage-framing';
import type { StageWork } from '../stage/stage-work';
import type { StageBox, StageShare, StageView } from '../stage/stage-zoom';
import {
  areaPointOfShare,
  shareOfAreaPoint,
  stageZoomOf,
  zoomedStageViewOf,
} from '../stage/stage-zoom';
import type { GestureIntent, GesturePoint, GesturePolicy } from './gesture-recogniser';
import { pulseHaptic } from './haptics';
import type { HitTarget } from './hit-priority';
import { pickHitTarget } from './hit-priority';
import type { LiftSize } from './lift-placement';
import { liftPlacementOf } from './lift-placement';
import type { DragReadout } from './use-drag-lift';
import { useGesture } from './use-gesture';

export interface StageGestureTarget {
  id: string;
  x: number;
  y: number;
  selected: boolean;
  priority: number;
}

export interface StageGestures {
  work: StageWork;
  frame: StageFrame;
  zoom: number;
  readout: DragReadout<string> | null;
}

interface UseStageGesturesOptions {
  targets: () => readonly StageGestureTarget[];
  onTap: (id: string | null) => void;
  onHold: (id: string | null) => void;
  onDragStart: (id: string, share: StageShare) => boolean;
  onDrag: (share: StageShare) => string | null;
  onDragEnd: () => void;
  onDragCancel: () => void;
}

const POLICY: GesturePolicy = { drag: true, navigate: true, longPress: true, precision: 'none' };
const TARGET_PX = 28;
const READOUT_SIZE = { width: 220, height: 34 };
const AREA = '[data-kk-stage-work]';

interface HeldReadout {
  finger: GesturePoint;
  text: string;
}

interface NavigatedView extends StageView {
  size: LiftSize | null;
}

const relativeBoxOf = (node: Element | null, area: Element | null): StageBox => {
  const box = node?.getBoundingClientRect();
  const origin = area?.getBoundingClientRect();
  if (box === undefined || origin === undefined) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  return {
    left: box.left - origin.left,
    top: box.top - origin.top,
    width: box.width,
    height: box.height,
  };
};

const hitTargetOf = (target: StageGestureTarget, plane: StageBox): HitTarget<string> => {
  const centre = areaPointOfShare(target, plane);

  return {
    id: target.id,
    x: centre.x - TARGET_PX / 2,
    y: centre.y - TARGET_PX / 2,
    width: TARGET_PX,
    height: TARGET_PX,
    priority: target.priority,
    selected: target.selected,
  };
};

export const useStageGestures = (options: UseStageGesturesOptions): StageGestures => {
  const plane = useRef<HTMLDivElement | null>(null);
  const dragPlane = useRef<StageBox | null>(null);
  const view = useRef<NavigatedView | null>(null);
  const [held, setHeld] = useState<HeldReadout | null>(null);
  const frameNow = useRef<StageFrame>(WHOLE_STAGE_FRAME);
  const size = useRef<LiftSize | null>(null);
  const [frame, setFrame] = useState<StageFrame>(WHOLE_STAGE_FRAME);

  const planeBox = (): StageBox =>
    relativeBoxOf(plane.current, plane.current?.closest(AREA) ?? null);
  const hitAt = (point: GesturePoint): string | null => {
    const box = planeBox();

    return pickHitTarget(
      options.targets().map((target) => hitTargetOf(target, box)),
      point,
    );
  };
  const show = (next: StageFrame): void => {
    frameNow.current = next;
    setFrame(next);
  };

  const onIntent = (intent: GestureIntent): void => {
    if (intent.kind !== 'navigate') {
      view.current = null;
    }
    switch (intent.kind) {
      case 'tap':
        options.onTap(hitAt(intent.point));
        return;
      case 'longPress': {
        const id = hitAt(intent.point);
        if (id !== null) {
          pulseHaptic();
        }
        options.onHold(id);
        return;
      }
      case 'dragStart': {
        const id = hitAt(intent.origin);
        const box = planeBox();
        dragPlane.current =
          id !== null && options.onDragStart(id, shareOfAreaPoint(intent.origin, box)) ? box : null;
        return;
      }
      case 'drag': {
        const box = dragPlane.current;
        if (box === null) {
          return;
        }
        const text = options.onDrag(shareOfAreaPoint(intent.point, box));
        setHeld(text === null ? null : { finger: intent.point, text });
        return;
      }
      case 'dragEnd':
        if (dragPlane.current !== null) {
          options.onDragEnd();
        }
        dragPlane.current = null;
        setHeld(null);
        return;
      case 'dragCancel':
        if (dragPlane.current !== null) {
          options.onDragCancel();
        }
        dragPlane.current = null;
        setHeld(null);
        return;
      case 'navigate': {
        const kept = view.current;
        const start =
          kept !== null && kept.size === size.current
            ? kept
            : { frame: frameNow.current, plane: planeBox() };
        const next = zoomedStageViewOf(start, intent.focal, intent.scale, {
          x: intent.dx,
          y: intent.dy,
        });
        view.current = { ...next, size: size.current };
        show(next.frame);
        return;
      }
      default:
        return;
    }
  };

  const gesture = useGesture({ policy: POLICY, onIntent });
  const areaSize = gesture.areaSize;
  useLayoutEffect(() => {
    size.current = areaSize;
  });
  const readout =
    held === null || areaSize === null
      ? null
      : { value: held.text, placement: liftPlacementOf(held.finger, areaSize, READOUT_SIZE) };

  return {
    work: {
      areaRef: gesture.areaRef,
      planeRef: plane,
      handlers: gesture.handlers,
    },
    frame,
    zoom: stageZoomOf(frame),
    readout,
  };
};
