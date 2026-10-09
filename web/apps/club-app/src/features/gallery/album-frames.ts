import type { KkFrameMark } from '@furria/ui';
import type { GalleryScene } from './gallery-scenes';
import type { AlbumItem } from './schemas';
import type { SelectionPhoto } from './types';

export interface AlbumFrame {
  id: number;
  number: number;
  capturedAt: string | null;
  item: AlbumItem;
}

export type StrokeMode = 'add' | 'remove';

export const albumFramesOf = (items: readonly AlbumItem[]): AlbumFrame[] =>
  items.map((item, index) => ({
    id: item.mediaItemId,
    number: index + 1,
    capturedAt: item.capturedAt,
    item,
  }));

export const frameMarkOf = (item: AlbumItem, showsSelection: boolean): KkFrameMark =>
  showsSelection && item.selectionPosition !== null
    ? { kind: 'selection', order: item.selectionPosition }
    : { kind: 'none' };

export const selectionOf = (items: readonly AlbumItem[]): AlbumItem[] =>
  items
    .filter((item) => item.selectionPosition !== null)
    .sort((left, right) => (left.selectionPosition ?? 0) - (right.selectionPosition ?? 0));

const toSelectionPhoto = (item: AlbumItem): SelectionPhoto => ({
  mediaItemId: item.mediaItemId,
  caption: item.caption,
});

export const isSelectable = (item: AlbumItem): boolean =>
  item.kind === 'photo' && item.state === 'ready';

export const selectionWith = (
  items: readonly AlbumItem[],
  ids: ReadonlySet<number>,
): SelectionPhoto[] => {
  const current = selectionOf(items);
  const additions = items.filter(
    (item) => ids.has(item.mediaItemId) && item.selectionPosition === null && isSelectable(item),
  );
  return [...current, ...additions].map(toSelectionPhoto);
};

export const selectionWithout = (
  items: readonly AlbumItem[],
  ids: ReadonlySet<number>,
): SelectionPhoto[] =>
  selectionOf(items)
    .filter((item) => !ids.has(item.mediaItemId))
    .map(toSelectionPhoto);

export const strokeModeOf = (selected: ReadonlySet<number>, anchorId: number): StrokeMode =>
  selected.has(anchorId) ? 'remove' : 'add';

export const strokeSelection = (
  base: ReadonlySet<number>,
  order: readonly number[],
  anchorId: number,
  currentId: number,
  mode: StrokeMode,
): Set<number> => {
  const from = order.indexOf(anchorId);
  const to = order.indexOf(currentId);
  if (from < 0 || to < 0) {
    return new Set(base);
  }
  const swept = order.slice(Math.min(from, to), Math.max(from, to) + 1);
  const next = new Set(base);
  for (const id of swept) {
    if (mode === 'add') {
      next.add(id);
    } else {
      next.delete(id);
    }
  }
  return next;
};

export const sceneIndexOfFrame = (
  scenes: readonly GalleryScene<AlbumFrame>[],
  number: number,
): number =>
  Math.max(
    scenes.findIndex((scene) => number >= scene.firstNumber && number <= scene.lastNumber),
    0,
  );

export const framesAround = (
  frames: readonly AlbumFrame[],
  number: number,
  reach: number,
): AlbumFrame[] => frames.filter((frame) => Math.abs(frame.number - number) <= reach);

export const steppedNumber = (number: number, delta: number, total: number): number =>
  Math.min(Math.max(number + delta, 1), total);
