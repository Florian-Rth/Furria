import type { PointerEvent, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { formBlock } from '@/features/running-order/running-order-ops';
import type { LineKey } from '@/features/running-order/schemas';
import { LineKeySchema } from '@/features/running-order/schemas';
import type { RunningOrderDraft } from '@/features/running-order/types';
import { tapBracket } from '../planner-rows';

interface BracketState {
  fromKey: LineKey;
  overKey: LineKey;
  moved: boolean;
}

export interface PlannerBracket {
  activeKey: LineKey | null;
  shownDraft: RunningOrderDraft | null;
  previewKeys: LineKey[];
  start: (key: LineKey, event: PointerEvent<HTMLButtonElement>) => void;
}

const ROW_SELECTOR = '[data-kk-numbered-row]';

const rowKeyAt = (list: HTMLDivElement | null, pointerY: number): LineKey | null => {
  if (list === null) {
    return null;
  }

  const rows = [...list.querySelectorAll<HTMLElement>(ROW_SELECTOR)];
  const hit = rows.find((row) => {
    const rect = row.getBoundingClientRect();

    return pointerY >= rect.top && pointerY <= rect.bottom;
  });
  const parsed = LineKeySchema.safeParse(hit?.dataset.kkNumberedRow);

  return parsed.success ? parsed.data : null;
};

export const usePlannerBracket = (
  draft: RunningOrderDraft,
  listRef: RefObject<HTMLDivElement | null>,
  apply: (next: RunningOrderDraft) => void,
): PlannerBracket => {
  const [bracket, setBracket] = useState<BracketState | null>(null);
  const bracketRef = useRef<BracketState | null>(null);
  const draftRef = useRef(draft);
  const applyRef = useRef(apply);

  useEffect(() => {
    draftRef.current = draft;
    applyRef.current = apply;
  });

  const update = (next: BracketState | null): void => {
    bracketRef.current = next;
    setBracket(next);
  };

  const start = (key: LineKey, event: PointerEvent<HTMLButtonElement>): void => {
    if (event.button !== 0 || bracketRef.current !== null) {
      return;
    }

    event.preventDefault();
    const handle = event.currentTarget;

    handle.setPointerCapture(event.pointerId);
    update({ fromKey: key, overKey: key, moved: false });

    const move = (moveEvent: globalThis.PointerEvent): void => {
      const current = bracketRef.current;
      const over = rowKeyAt(listRef.current, moveEvent.clientY);

      if (current === null || over === null || over === current.overKey) {
        return;
      }
      update({ ...current, overKey: over, moved: true });
    };
    const finish = (commit: boolean): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      const current = bracketRef.current;

      update(null);
      if (!commit || current === null) {
        return;
      }
      if (!current.moved || current.overKey === current.fromKey) {
        applyRef.current(tapBracket(draftRef.current, current.fromKey));
        return;
      }
      applyRef.current(formBlock(draftRef.current, current.fromKey, current.overKey));
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

  if (bracket === null || bracket.overKey === bracket.fromKey) {
    return { activeKey: bracket?.fromKey ?? null, shownDraft: null, previewKeys: [], start };
  }

  const shown = formBlock(draft, bracket.fromKey, bracket.overKey);
  const blockKey = shown.lines.find((line) => line.key === bracket.fromKey)?.blockKey ?? null;
  const previewKeys =
    blockKey === null
      ? []
      : shown.lines.filter((line) => line.blockKey === blockKey).map((line) => line.key);

  return { activeKey: bracket.fromKey, shownDraft: shown, previewKeys, start };
};
