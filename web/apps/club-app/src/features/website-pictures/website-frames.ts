import type { KkFrameMark, KkFrameState } from '@furria/ui/KkFrame';
import type { KkSlotFlag, KkSlotFlagTone, KkSlotRowPosition } from '@furria/ui/KkSlotRow';
import type { DeskPhase } from './hooks/use-position-desk';
import type { SlotPositionRef } from './types';
import type { BoardPosition, PositionStatus, SlotFlag } from './website-board';
import { positionLabelOf } from './website-copy';

const FRAME_STATES: Record<PositionStatus, KkFrameState> = {
  empty: 'ready',
  processing: 'processing',
  stalled: 'processing',
  failed: 'failed',
  ready: 'ready',
  mismatch: 'ready',
};

const FLAG_TONES: Record<SlotFlag, KkSlotFlagTone> = {
  failed: 'red',
  stalled: 'gold',
  mismatch: 'gold',
  altMissing: 'red',
  processing: 'muted',
  empty: 'muted',
};

export const positionFrameOf = (position: BoardPosition): KkSlotRowPosition => ({
  id: `${position.slot}:${position.position}`,
  label: positionLabelOf(
    position.slotTitle,
    position.position,
    position.count,
    position.aspect,
    position.status,
  ),
  aspect: position.aspect,
  edge: String(position.position),
  source:
    position.picture?.picture.picture?.smallUrl ??
    position.picture?.picture.uncroppedUrl ??
    undefined,
  state: FRAME_STATES[position.status],
  mark: position.status === 'mismatch' ? { kind: 'recut' } : { kind: 'none' },
  placeholder: true,
});

export const slotFlagOf = (
  flag: SlotFlag | null,
  textOf: (flag: SlotFlag) => string,
): KkSlotFlag | undefined =>
  flag === null ? undefined : { text: textOf(flag), tone: FLAG_TONES[flag] };

export const selectedIndexOf = (
  positions: readonly BoardPosition[],
  selected: SlotPositionRef | null,
): number | null => {
  if (selected === null) {
    return null;
  }
  const index = positions.findIndex(
    (position) => position.slot === selected.slot && position.position === selected.position,
  );
  return index < 0 ? null : index;
};

export interface DeskFrame {
  source: string | undefined;
  state: KkFrameState;
  mark: KkFrameMark;
}

interface DeskProgress {
  phase: DeskPhase;
  uploadSource: string | null;
}

export const deskFrameOf = (position: BoardPosition, desk: DeskProgress): DeskFrame => {
  if (desk.phase === 'uploading' || desk.phase === 'failed') {
    return {
      source: desk.uploadSource ?? undefined,
      state: desk.phase === 'uploading' ? 'uploading' : 'failed',
      mark: { kind: 'none' },
    };
  }
  const editing = position.picture?.picture;
  return {
    source: editing?.picture?.mediumUrl ?? editing?.uncroppedUrl ?? undefined,
    state: FRAME_STATES[position.status],
    mark: position.status === 'mismatch' ? { kind: 'recut' } : { kind: 'none' },
  };
};
