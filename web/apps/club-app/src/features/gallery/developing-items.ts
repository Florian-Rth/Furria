import type { MediaItemState } from '@/lib/api/schemas';
import { developingPollMsOf } from '@/lib/media/developing';
import type { InboxItem } from './schemas';

export const POLL_BATCH_LIMIT = 200;

export type DevelopedItems = ReadonlyMap<number, InboxItem | null>;

interface ItemState {
  mediaItemId: number;
  state: MediaItemState;
}

const isSettled = (developed: DevelopedItems, mediaItemId: number): boolean => {
  const item = developed.get(mediaItemId);
  return item === null || (item !== undefined && item.state !== 'processing');
};

export const pollBatchOf = (
  lists: readonly (readonly ItemState[])[],
  uploadedIds: readonly number[],
  developed: DevelopedItems,
): number[] => {
  const listed = lists.flatMap((items) =>
    items.filter((item) => item.state === 'processing').map((item) => item.mediaItemId),
  );
  const uploaded = uploadedIds.filter((mediaItemId) => !isSettled(developed, mediaItemId));
  return [...new Set([...listed, ...uploaded])]
    .sort((left, right) => left - right)
    .slice(0, POLL_BATCH_LIMIT);
};

interface DevelopingProgress {
  state: MediaItemState;
  isStalled: boolean;
}

const isMoving = (item: DevelopingProgress): boolean =>
  item.state === 'processing' && !item.isStalled;

export const developingPollDelayOf = (
  lists: readonly (readonly DevelopingProgress[])[],
  uploadedIds: readonly number[],
  developed: DevelopedItems,
): number => {
  const isAwaitingFirstAnswer = uploadedIds.some((mediaItemId) => !developed.has(mediaItemId));
  const known = [
    ...lists.flat(),
    ...[...developed.values()].filter((item): item is InboxItem => item !== null),
  ];
  const isFresh = isAwaitingFirstAnswer || known.some(isMoving);
  return developingPollMsOf(!isFresh);
};

const captureTimeOf = (item: InboxItem): number => Date.parse(item.capturedAt ?? item.uploadedAt);

const inCaptureOrder = (left: InboxItem, right: InboxItem): number =>
  captureTimeOf(left) - captureTimeOf(right) || left.mediaItemId - right.mediaItemId;

export const mergeItems = <TItem extends InboxItem>(
  items: readonly TItem[],
  polled: readonly number[],
  answers: readonly InboxItem[],
): TItem[] => {
  const polledIds = new Set(polled);
  const answered = new Map(answers.map((answer) => [answer.mediaItemId, answer]));
  return items
    .filter((item) => !polledIds.has(item.mediaItemId) || answered.has(item.mediaItemId))
    .map((item) => {
      const answer = answered.get(item.mediaItemId);
      return answer === undefined ? item : { ...item, ...answer };
    })
    .sort(inCaptureOrder);
};

export const developedAfter = (
  developed: DevelopedItems,
  polled: readonly number[],
  answers: readonly InboxItem[],
): DevelopedItems => {
  const answered = new Map(answers.map((answer) => [answer.mediaItemId, answer]));
  return new Map([
    ...developed,
    ...polled.map((mediaItemId): [number, InboxItem | null] => [
      mediaItemId,
      answered.get(mediaItemId) ?? null,
    ]),
  ]);
};
