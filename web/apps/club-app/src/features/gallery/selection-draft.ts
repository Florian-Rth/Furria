import type { AlbumDetails, AlbumItem } from './schemas';
import type { SelectionPhoto } from './types';

export interface SelectionEntry {
  mediaItemId: number;
  caption: string;
}

export type PublicationState =
  | { kind: 'noSession' }
  | { kind: 'empty' }
  | { kind: 'unsaved' }
  | { kind: 'ready' }
  | { kind: 'published' };

export const SOFT_SELECTION_SIZE = 12;

const bySelectionPosition = (left: AlbumItem, right: AlbumItem): number =>
  (left.selectionPosition ?? 0) - (right.selectionPosition ?? 0);

export const selectionDraftOf = (items: readonly AlbumItem[]): SelectionEntry[] =>
  items
    .filter((item) => item.selectionPosition !== null)
    .sort(bySelectionPosition)
    .map((item) => ({ mediaItemId: item.mediaItemId, caption: item.caption ?? '' }));

export const isSelectionDirty = (
  draft: readonly SelectionEntry[],
  saved: readonly SelectionEntry[],
): boolean =>
  draft.length !== saved.length ||
  draft.some((entry, index) => {
    const twin = saved[index];
    return (
      twin === undefined ||
      twin.mediaItemId !== entry.mediaItemId ||
      twin.caption.trim() !== entry.caption.trim()
    );
  });

export const moveEntry = <TEntry>(list: readonly TEntry[], from: number, to: number): TEntry[] => {
  const last = list.length - 1;
  const target = Math.min(Math.max(to, 0), last);
  const moving = list[from];
  if (moving === undefined || from === target) {
    return [...list];
  }
  const rest = list.filter((_entry, index) => index !== from);
  return [...rest.slice(0, target), moving, ...rest.slice(target)];
};

export const addEntries = (
  draft: readonly SelectionEntry[],
  mediaItemIds: readonly number[],
): SelectionEntry[] => {
  const present = new Set(draft.map((entry) => entry.mediaItemId));
  const added = mediaItemIds
    .filter((id) => !present.has(id))
    .map((mediaItemId) => ({ mediaItemId, caption: '' }));
  return [...draft, ...added];
};

export const removeEntry = (
  draft: readonly SelectionEntry[],
  mediaItemId: number,
): SelectionEntry[] => draft.filter((entry) => entry.mediaItemId !== mediaItemId);

export const captionEntry = (
  draft: readonly SelectionEntry[],
  mediaItemId: number,
  caption: string,
): SelectionEntry[] =>
  draft.map((entry) => (entry.mediaItemId === mediaItemId ? { ...entry, caption } : entry));

export const toSelectionPhotos = (draft: readonly SelectionEntry[]): SelectionPhoto[] =>
  draft.map((entry) => {
    const caption = entry.caption.trim();
    return { mediaItemId: entry.mediaItemId, caption: caption === '' ? null : caption };
  });

export const publicationStateOf = (
  album: Pick<AlbumDetails, 'sessionStartYear' | 'publishedAt'>,
  draft: readonly SelectionEntry[],
  isDirty: boolean,
): PublicationState => {
  if (album.publishedAt !== null && !isDirty) {
    return { kind: 'published' };
  }
  if (album.sessionStartYear === null) {
    return { kind: 'noSession' };
  }
  if (draft.length === 0) {
    return { kind: 'empty' };
  }
  return isDirty ? { kind: 'unsaved' } : { kind: 'ready' };
};

export const pickableItemsOf = (
  items: readonly AlbumItem[],
  draft: readonly SelectionEntry[],
): AlbumItem[] => {
  const chosen = new Set(draft.map((entry) => entry.mediaItemId));
  return items.filter(
    (item) => item.kind === 'photo' && item.state === 'ready' && !chosen.has(item.mediaItemId),
  );
};

export const altFallbackOf = (albumTitle: string, position: number): string =>
  `${albumTitle}, Foto ${position}`;

export const marksTitlePhoto = (
  album: Pick<AlbumDetails, 'chosenCoverMediaItemId'>,
  position: number,
): boolean => album.chosenCoverMediaItemId === null && position === 1;

export const toggleId = (chosen: ReadonlySet<number>, id: number): Set<number> => {
  const next = new Set(chosen);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
};

export interface SelectionSlot {
  entry: SelectionEntry;
  item: AlbumItem;
  position: number;
}

export const selectionSlotsOf = (
  draft: readonly SelectionEntry[],
  items: readonly AlbumItem[],
): SelectionSlot[] => {
  const byId = new Map(items.map((item) => [item.mediaItemId, item]));
  const present = draft.flatMap((entry) => {
    const item = byId.get(entry.mediaItemId);
    return item === undefined ? [] : [{ entry, item }];
  });
  return present.map((slot, index) => ({ ...slot, position: index + 1 }));
};
