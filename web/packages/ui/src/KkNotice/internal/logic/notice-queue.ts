import type { KkNoticeRequest, KkNoticeTone } from '../../notice-declaration';

export interface KkNoticeEntry extends KkNoticeRequest {
  id: string;
}

export interface KkNoticeQueue {
  entries: readonly KkNoticeEntry[];
  isOpen: boolean;
}

const lifetimes: Record<KkNoticeTone, number> = { success: 5000, info: 5000, error: 8000 };

export const EMPTY_NOTICE_QUEUE: KkNoticeQueue = { entries: [], isOpen: false };

export const currentNotice = (queue: KkNoticeQueue): KkNoticeEntry | null =>
  queue.entries[0] ?? null;

export const awaitsAnswer = (notice: KkNoticeRequest): boolean =>
  notice.group === undefined && (notice.detail !== undefined || notice.actions !== undefined);

export const noticeLifetimeMs = (queue: KkNoticeQueue): number | null => {
  const entry = currentNotice(queue);

  if (entry === null || !queue.isOpen || awaitsAnswer(entry)) {
    return null;
  }

  return lifetimes[entry.tone];
};

const waitsAlready = (queue: KkNoticeQueue, entry: KkNoticeEntry): boolean =>
  awaitsAnswer(entry) &&
  queue.entries.some(
    (queued, index) =>
      (index > 0 || queue.isOpen) &&
      awaitsAnswer(queued) &&
      queued.tone === entry.tone &&
      queued.message === entry.message,
  );

const sharesGroup = (queued: KkNoticeEntry, entry: KkNoticeEntry): boolean =>
  entry.group !== undefined && queued.group === entry.group;

const replacedInGroup = (queue: KkNoticeQueue, entry: KkNoticeEntry): KkNoticeQueue => {
  const [showing, ...waiting] = queue.entries;
  const kept = waiting.filter((queued) => !sharesGroup(queued, entry));

  if (showing !== undefined && queue.isOpen && sharesGroup(showing, entry)) {
    return { entries: [entry, ...kept], isOpen: true };
  }

  return {
    entries: showing === undefined ? [entry] : [showing, ...kept, entry],
    isOpen: showing === undefined ? true : queue.isOpen,
  };
};

export const enqueueNotice = (queue: KkNoticeQueue, entry: KkNoticeEntry): KkNoticeQueue => {
  if (entry.group !== undefined) {
    return replacedInGroup(queue, entry);
  }

  return waitsAlready(queue, entry)
    ? queue
    : {
        entries: [...queue.entries, entry],
        isOpen: queue.entries.length === 0 ? true : queue.isOpen,
      };
};

export const closeNotice = (queue: KkNoticeQueue): KkNoticeQueue => ({ ...queue, isOpen: false });

export const finishNoticeExit = (queue: KkNoticeQueue): KkNoticeQueue => {
  const remaining = queue.entries.slice(1);

  return { entries: remaining, isOpen: remaining.length > 0 };
};

const isBoundToScreen = (entry: KkNoticeEntry): boolean => entry.actions !== undefined;

export const leaveScreen = (queue: KkNoticeQueue): KkNoticeQueue => {
  const [showing, ...waiting] = queue.entries;
  const kept = waiting.filter((entry) => !isBoundToScreen(entry));

  if (showing === undefined) {
    return queue;
  }
  if (isBoundToScreen(showing)) {
    return { entries: [showing, ...kept], isOpen: false };
  }

  return { entries: [showing, ...kept], isOpen: queue.isOpen };
};
