import type { GalleryScene } from './gallery-scenes';
import { scenesOf } from './gallery-scenes';
import type { CullFrame, CullState } from './light-table';
import { startCulling, verdictOf } from './light-table';

export interface DeskSource {
  mediaItemId: number;
  state: 'processing' | 'ready' | 'failed';
  capturedAt: string | null;
  uploadedAt: string;
}

export interface Desk<TItem extends DeskSource> {
  items: Map<number, TItem>;
  frames: CullFrame[];
  scenes: GalleryScene<{ id: number; capturedAt: string | null }>[];
  developing: number;
}

const momentOf = (item: DeskSource): string => item.capturedAt ?? item.uploadedAt;

export const deskOf = <TItem extends DeskSource>(
  items: readonly TItem[],
  hidden: ReadonlySet<number>,
): Desk<TItem> => {
  const ready = items
    .filter((item) => item.state === 'ready' && !hidden.has(item.mediaItemId))
    .sort(
      (left, right) =>
        momentOf(left).localeCompare(momentOf(right)) || left.mediaItemId - right.mediaItemId,
    );
  const scenes = scenesOf(
    ready.map((item) => ({ id: item.mediaItemId, capturedAt: item.capturedAt })),
  );
  return {
    items: new Map(ready.map((item) => [item.mediaItemId, item])),
    frames: scenes.flatMap((scene, index) =>
      scene.frames.map((frame) => ({ id: frame.id, scene: index })),
    ),
    scenes,
    developing: items.filter((item) => item.state === 'processing').length,
  };
};

export const deskKeyOf = (frames: readonly CullFrame[]): string =>
  frames.map((frame) => `${frame.id}:${frame.scene}`).join(',');

export const reconcileCulling = (state: CullState, frames: readonly CullFrame[]): CullState => {
  const present = new Set(frames.map((frame) => frame.id));
  const fresh = startCulling(frames);
  const verdicts: CullState['verdicts'] = {};
  for (const frame of frames) {
    const verdict = verdictOf(state, frame.id);
    if (verdict.kind !== 'open') {
      verdicts[frame.id] = verdict;
    }
  }
  const history = state.history
    .map((step) => ({ ...step, changed: step.changed.filter((change) => present.has(change.id)) }))
    .filter((step) => step.changed.length > 0);
  const currentId = state.frames[state.cursor]?.id;
  const cursor = frames.findIndex((frame) => frame.id === currentId);
  return {
    ...fresh,
    verdicts,
    history,
    cursor: cursor < 0 ? Math.min(state.cursor, Math.max(frames.length - 1, 0)) : cursor,
  };
};

export interface CommitPlan {
  placements: { albumId: number; mediaItemIds: number[] }[];
  rejects: number[];
}

export const commitPlanOf = (
  state: CullState,
  slotAlbums: readonly (number | null)[],
): CommitPlan => {
  const placed = new Map<number, number[]>();
  const rejects: number[] = [];
  for (const frame of state.frames) {
    const verdict = verdictOf(state, frame.id);
    if (verdict.kind === 'rejected') {
      rejects.push(frame.id);
    }
    const albumId = verdict.kind === 'filed' ? (slotAlbums[verdict.slot] ?? null) : null;
    if (albumId !== null) {
      placed.set(albumId, [...(placed.get(albumId) ?? []), frame.id]);
    }
  }
  return {
    placements: [...placed].map(([albumId, mediaItemIds]) => ({ albumId, mediaItemIds })),
    rejects,
  };
};

export const committedIdsOf = (plan: CommitPlan): number[] => [
  ...plan.rejects,
  ...plan.placements.flatMap((placement) => placement.mediaItemIds),
];

export const isEmptyPlan = (plan: CommitPlan): boolean => committedIdsOf(plan).length === 0;

export const defaultSlotsOf = (
  albums: readonly { albumId: number; createdAt: string }[],
  count: number,
): number[] =>
  [...albums]
    .sort(
      (left, right) =>
        right.createdAt.localeCompare(left.createdAt) || right.albumId - left.albumId,
    )
    .slice(0, count)
    .map((album) => album.albumId);
