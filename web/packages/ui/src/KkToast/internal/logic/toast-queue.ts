import type { KkIconName } from '../../../KkIcon';

export type KkToastTone = 'success' | 'error' | 'info';

export interface KkToastRequest {
  tone: KkToastTone;
  message: string;
  icon?: KkIconName;
}

export interface KkToastEntry extends KkToastRequest {
  id: string;
}

export interface KkToastQueue {
  entries: readonly KkToastEntry[];
  isOpen: boolean;
}

const durations: Record<KkToastTone, number> = { success: 5000, info: 5000, error: 8000 };

export const EMPTY_TOAST_QUEUE: KkToastQueue = { entries: [], isOpen: false };

export const toastDurationMs = (tone: KkToastTone): number => durations[tone];

export const currentToast = (queue: KkToastQueue): KkToastEntry | null => queue.entries[0] ?? null;

export const enqueueToast = (queue: KkToastQueue, entry: KkToastEntry): KkToastQueue => ({
  entries: [...queue.entries, entry],
  isOpen: queue.entries.length === 0 ? true : queue.isOpen,
});

export const closeToast = (queue: KkToastQueue): KkToastQueue => ({ ...queue, isOpen: false });

export const finishToastExit = (queue: KkToastQueue): KkToastQueue => {
  const remaining = queue.entries.slice(1);

  return { entries: remaining, isOpen: remaining.length > 0 };
};
