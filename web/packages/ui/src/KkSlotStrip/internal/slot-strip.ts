export type KkSlotKind = 'running' | 'retrying' | 'queued';

export interface SlotStripCell {
  key: string;
  kind: KkSlotKind;
}

export interface SlotStrip {
  cells: SlotStripCell[];
  overflow: number;
}

const cellsOf = (kind: KkSlotKind, count: number): SlotStripCell[] =>
  Array.from({ length: Math.max(count, 0) }, (_, order) => ({ key: `${kind}-${order}`, kind }));

export const slotStripOf = (
  running: number,
  retrying: number,
  queued: number,
  cap: number,
): SlotStrip => {
  const all = [
    ...cellsOf('running', running),
    ...cellsOf('retrying', retrying),
    ...cellsOf('queued', queued),
  ];

  if (all.length <= cap) {
    return { cells: all, overflow: 0 };
  }

  return { cells: all.slice(0, cap), overflow: all.length - cap };
};
