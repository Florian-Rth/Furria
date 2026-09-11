import { describe, expect, it } from 'vitest';
import type { KkToastEntry, KkToastQueue } from './toast-queue';
import {
  closeToast,
  currentToast,
  EMPTY_TOAST_QUEUE,
  enqueueToast,
  finishToastExit,
} from './toast-queue';

const entry = (id: string): KkToastEntry => ({ id, tone: 'success', message: `Toast ${id}` });

const showing = (...ids: readonly string[]): KkToastQueue => ({
  entries: ids.map(entry),
  isOpen: true,
});

describe('enqueueToast', () => {
  it('opens the region for the first toast', () => {
    expect(enqueueToast(EMPTY_TOAST_QUEUE, entry('a'))).toEqual({
      entries: [entry('a')],
      isOpen: true,
    });
  });

  it('queues behind a toast that is already showing', () => {
    const queue = enqueueToast(showing('a'), entry('b'));

    expect(queue.isOpen).toBe(true);
    expect(currentToast(queue)).toEqual(entry('a'));
    expect(queue.entries).toHaveLength(2);
  });

  it('does not reopen a toast that is still leaving', () => {
    const leaving: KkToastQueue = { entries: [entry('a')], isOpen: false };

    expect(enqueueToast(leaving, entry('b')).isOpen).toBe(false);
  });
});

describe('closeToast', () => {
  it('keeps the entry so the exit can play out', () => {
    expect(closeToast(showing('a', 'b'))).toEqual({
      entries: [entry('a'), entry('b')],
      isOpen: false,
    });
  });
});

describe('finishToastExit', () => {
  it('drops the toast that left and opens the next one', () => {
    const queue = finishToastExit({ entries: [entry('a'), entry('b')], isOpen: false });

    expect(queue).toEqual({ entries: [entry('b')], isOpen: true });
  });

  it('closes the region when the last toast has left', () => {
    expect(finishToastExit({ entries: [entry('a')], isOpen: false })).toEqual(EMPTY_TOAST_QUEUE);
  });

  it('stays empty when nothing is queued', () => {
    expect(finishToastExit(EMPTY_TOAST_QUEUE)).toEqual(EMPTY_TOAST_QUEUE);
  });

  it('drains three toasts in arrival order', () => {
    const first = enqueueToast(
      enqueueToast(enqueueToast(EMPTY_TOAST_QUEUE, entry('a')), entry('b')),
      entry('c'),
    );
    const second = finishToastExit(closeToast(first));
    const third = finishToastExit(closeToast(second));

    expect(currentToast(first)).toEqual(entry('a'));
    expect(currentToast(second)).toEqual(entry('b'));
    expect(currentToast(third)).toEqual(entry('c'));
    expect(third.isOpen).toBe(true);
  });
});

describe('currentToast', () => {
  it('has nothing to show while the queue is empty', () => {
    expect(currentToast(EMPTY_TOAST_QUEUE)).toBeNull();
  });
});
