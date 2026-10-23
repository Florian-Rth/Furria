import type { KeyboardEvent, PointerEvent, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { moveUnit, orderOf, previewMove } from '@/features/running-order/running-order-ops';
import type { LineKey } from '@/features/running-order/schemas';
import { LineKeySchema } from '@/features/running-order/schemas';
import type { RunningOrderDraft } from '@/features/running-order/types';
import { unitLeadOf } from '../planner-fixes';
import type { DropBoundary, DropEdge, RowSpan } from '../planner-modes';
import { autoScrollSpeedOf, dropBoundariesOf, nearestBoundaryOf } from '../planner-modes';
import { conflictsTouching, unitKeysOf } from '../planner-rows';

interface DragState {
  key: LineKey;
  keys: LineKey[];
  from: number;
  target: number;
  landing: DropBoundary | null;
  boundaries: DropBoundary[];
  restTop: number;
  unitHeight: number;
  pointerY: number;
  grabY: number;
  grabOffset: number;
  unitTop: number;
}

export interface DragReadout {
  conflicts: number;
}

export interface DropMark {
  key: LineKey;
  edge: DropEdge;
}

export interface PlannerDrag {
  listRef: RefObject<HTMLDivElement | null>;
  draggingKeys: LineKey[];
  shift: number;
  drop: DropMark | null;
  numberOf: (key: LineKey) => number | null;
  readout: DragReadout | null;
  start: (key: LineKey, event: PointerEvent<HTMLButtonElement>) => void;
  nudge: (key: LineKey, event: KeyboardEvent<HTMLButtonElement>) => void;
}

const NUDGE_STEPS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
const ROW_SELECTOR = '[data-kk-numbered-row]';
const CHROME_TOP = 112;
const CHROME_BOTTOM = 140;

const rowsOf = (list: HTMLDivElement | null): HTMLElement[] =>
  list === null ? [] : [...list.querySelectorAll<HTMLElement>(ROW_SELECTOR)];

const listTopOf = (list: HTMLDivElement | null): number => list?.getBoundingClientRect().top ?? 0;

const spansOf = (list: HTMLDivElement | null, keys: readonly LineKey[]): RowSpan[] => {
  const listTop = listTopOf(list);

  return rowsOf(list).flatMap((row) => {
    const parsed = LineKeySchema.safeParse(row.dataset.kkNumberedRow);

    if (!parsed.success || !keys.includes(parsed.data)) {
      return [];
    }

    const rect = row.getBoundingClientRect();

    return [{ key: parsed.data, top: rect.top - listTop, bottom: rect.bottom - listTop }];
  });
};

const NO_DRAG: Omit<PlannerDrag, 'listRef' | 'start' | 'nudge'> = {
  draggingKeys: [],
  shift: 0,
  drop: null,
  numberOf: () => null,
  readout: null,
};

export const usePlannerDrag = (
  draft: RunningOrderDraft,
  apply: (next: RunningOrderDraft) => void,
): PlannerDrag => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const draftRef = useRef(draft);
  const applyRef = useRef(apply);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    draftRef.current = draft;
    applyRef.current = apply;
  });

  const update = (next: DragState | null): void => {
    dragRef.current = next;
    setDrag(next);
  };

  const follow = (pointerY: number): void => {
    const current = dragRef.current;

    if (current === null) {
      return;
    }

    const unitTop = pointerY - current.grabOffset - listTopOf(listRef.current);
    const landing = nearestBoundaryOf(current.boundaries, unitTop + current.unitHeight / 2);
    const target = landing?.target ?? current.from;

    if (target === current.target && unitTop === current.unitTop) {
      return;
    }
    update({ ...current, pointerY, target, landing, unitTop });
  };

  const stopScrolling = (): void => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const scrollStep = (): void => {
    const current = dragRef.current;

    if (current === null) {
      frameRef.current = null;
      return;
    }

    const speed = autoScrollSpeedOf(
      current.pointerY,
      current.grabY,
      CHROME_TOP,
      window.innerHeight - CHROME_BOTTOM,
    );

    if (speed !== 0) {
      window.scrollBy(0, speed);
    }
    follow(current.pointerY);
    frameRef.current = window.requestAnimationFrame(scrollStep);
  };

  useEffect(() => stopScrolling, []);

  const start = (key: LineKey, event: PointerEvent<HTMLButtonElement>): void => {
    if (event.button !== 0 || dragRef.current !== null) {
      return;
    }

    event.preventDefault();
    const handle = event.currentTarget;
    const current = draftRef.current;
    const lead = unitLeadOf(current, key);
    const keys = unitKeysOf(current, key);
    const order = orderOf(current);
    const from = order.indexOf(lead);
    const placedSpans = spansOf(listRef.current, order);
    const [unitSpan] = spansOf(listRef.current, [lead]);
    const unitBottom = Math.max(
      ...spansOf(listRef.current, keys).map((span) => span.bottom),
      unitSpan?.bottom ?? 0,
    );
    const restTop = unitSpan?.top ?? 0;
    const listTop = listTopOf(listRef.current);

    handle.setPointerCapture(event.pointerId);
    update({
      key: lead,
      keys,
      from,
      target: from,
      landing: null,
      boundaries: dropBoundariesOf(placedSpans, order, keys),
      restTop,
      unitHeight: unitBottom - restTop,
      pointerY: event.clientY,
      grabY: event.clientY,
      grabOffset: event.clientY - listTop - restTop,
      unitTop: restTop,
    });
    frameRef.current = window.requestAnimationFrame(scrollStep);

    const move = (moveEvent: globalThis.PointerEvent): void => {
      follow(moveEvent.clientY);
    };
    const finish = (commit: boolean): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      stopScrolling();
      const ended = dragRef.current;

      update(null);
      if (commit && ended !== null && ended.target !== ended.from) {
        applyRef.current(moveUnit(draftRef.current, ended.key, ended.target));
      }
    };
    const up = (): void => {
      finish(true);
    };
    const cancel = (): void => {
      finish(false);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  };

  const nudge = (key: LineKey, event: KeyboardEvent<HTMLButtonElement>): void => {
    const step = NUDGE_STEPS[event.key] ?? 0;

    if (step === 0) {
      return;
    }

    event.preventDefault();
    const lead = unitLeadOf(draft, key);
    const at = orderOf(draft).indexOf(lead);
    const target = at < 0 ? orderOf(draft).length : at + step;

    if (target < 0) {
      return;
    }
    apply(moveUnit(draft, lead, target));
  };

  if (drag === null) {
    return { listRef, ...NO_DRAG, start, nudge };
  }

  const moved = drag.target !== drag.from;
  const preview = drag.target < 0 ? null : previewMove(draft, drag.key, drag.target);
  const numberOf = (key: LineKey): number | null => {
    const at = preview === null || !moved ? -1 : preview.order.indexOf(key);

    return at < 0 || !drag.keys.includes(key) ? null : at + 1;
  };

  return {
    listRef,
    draggingKeys: drag.keys,
    shift: drag.unitTop - drag.restTop,
    drop:
      !moved || drag.landing === null ? null : { key: drag.landing.key, edge: drag.landing.edge },
    numberOf,
    readout:
      preview === null ? null : { conflicts: conflictsTouching(preview.findings, drag.keys) },
    start,
    nudge,
  };
};
