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
  notice.detail !== undefined || notice.actions !== undefined;

export const noticeLifetimeMs = (queue: KkNoticeQueue): number | null => {
  const entry = currentNotice(queue);

  if (entry === null || !queue.isOpen || awaitsAnswer(entry)) {
    return null;
  }

  return lifetimes[entry.tone];
};

export const enqueueNotice = (queue: KkNoticeQueue, entry: KkNoticeEntry): KkNoticeQueue => ({
  entries: [...queue.entries, entry],
  isOpen: queue.entries.length === 0 ? true : queue.isOpen,
});

export const closeNotice = (queue: KkNoticeQueue): KkNoticeQueue => ({ ...queue, isOpen: false });

export const finishNoticeExit = (queue: KkNoticeQueue): KkNoticeQueue => {
  const remaining = queue.entries.slice(1);

  return { entries: remaining, isOpen: remaining.length > 0 };
};
