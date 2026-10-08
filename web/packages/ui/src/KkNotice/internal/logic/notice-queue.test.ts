import { describe, expect, it } from 'vitest';
import type { KkNoticeEntry, KkNoticeQueue } from './notice-queue';
import {
  closeNotice,
  currentNotice,
  EMPTY_NOTICE_QUEUE,
  enqueueNotice,
  finishNoticeExit,
  noticeLifetimeMs,
} from './notice-queue';

const entry = (id: string): KkNoticeEntry => ({ id, tone: 'success', message: id });

const showing = (...ids: readonly string[]): KkNoticeQueue => ({
  entries: ids.map(entry),
  isOpen: true,
});

describe('enqueueNotice', () => {
  it.each([
    { queue: EMPTY_NOTICE_QUEUE, isOpen: true },
    { queue: showing('a'), isOpen: true },
    { queue: { entries: [entry('a')], isOpen: false }, isOpen: false },
  ])(
    'keeps the region open=$isOpen after queueing behind $queue.entries.length',
    ({ queue, isOpen }) => {
      const next = enqueueNotice(queue, entry('b'));

      expect(next.isOpen).toBe(isOpen);
      expect(next.entries.at(-1)).toEqual(entry('b'));
    },
  );
});

describe('finishNoticeExit', () => {
  it.each([
    { entries: ['a', 'b'], expected: { entries: [entry('b')], isOpen: true } },
    { entries: ['a'], expected: EMPTY_NOTICE_QUEUE },
  ])('drops the notice that left from $entries', ({ entries, expected }) => {
    expect(finishNoticeExit({ entries: entries.map(entry), isOpen: false })).toEqual(expected);
  });

  it('drains three notices in arrival order', () => {
    const first = enqueueNotice(
      enqueueNotice(enqueueNotice(EMPTY_NOTICE_QUEUE, entry('a')), entry('b')),
      entry('c'),
    );
    const second = finishNoticeExit(closeNotice(first));
    const third = finishNoticeExit(closeNotice(second));

    expect([first, second, third].map((queue) => currentNotice(queue)?.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(third.isOpen).toBe(true);
  });
});

describe('noticeLifetimeMs', () => {
  it.each<{ name: string; queue: KkNoticeQueue; expires: boolean }>([
    { name: 'an open confirmation', queue: showing('a'), expires: true },
    {
      name: 'a notice with rows',
      queue: { entries: [{ id: 'a', tone: 'error', message: 'a', detail: ['d'] }], isOpen: true },
      expires: false,
    },
    {
      name: 'a notice with actions',
      queue: {
        entries: [
          {
            id: 'a',
            tone: 'error',
            message: 'a',
            actions: [{ id: 'retry', label: 'r', onSelect: (): void => {} }],
          },
        ],
        isOpen: true,
      },
      expires: false,
    },
    { name: 'a closed region', queue: { entries: [entry('a')], isOpen: false }, expires: false },
    { name: 'an empty queue', queue: EMPTY_NOTICE_QUEUE, expires: false },
  ])('expires $name: $expires', ({ queue, expires }) => {
    expect(noticeLifetimeMs(queue) !== null).toBe(expires);
  });
});
