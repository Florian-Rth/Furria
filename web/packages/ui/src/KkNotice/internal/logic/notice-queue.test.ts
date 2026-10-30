import { describe, expect, it } from 'vitest';
import type { KkNoticeEntry, KkNoticeQueue } from './notice-queue';
import {
  closeNotice,
  currentNotice,
  EMPTY_NOTICE_QUEUE,
  enqueueNotice,
  finishNoticeExit,
  leaveScreen,
  noticeLifetimeMs,
} from './notice-queue';

const entry = (id: string): KkNoticeEntry => ({ id, tone: 'success', message: id });

const undoable = (id: string): KkNoticeEntry => ({
  id,
  tone: 'info',
  message: id,
  actions: [{ id: 'undo', label: 'u', onSelect: (): void => {} }],
});

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

describe('enqueueNotice with an open question', () => {
  const question = (id: string, message: string): KkNoticeEntry => ({
    id,
    tone: 'error',
    message,
    actions: [{ id: 'reload', label: 'r', onSelect: (): void => {} }],
  });

  it.each([
    {
      name: 'the same question already waits',
      queue: [question('a', 'x')],
      isOpen: true,
      length: 1,
    },
    { name: 'the same question is leaving', queue: [question('a', 'x')], isOpen: false, length: 2 },
    { name: 'another question waits', queue: [question('a', 'y')], isOpen: true, length: 2 },
  ])('keeps $length notices when $name', ({ queue, isOpen, length }) => {
    const next = enqueueNotice({ entries: queue, isOpen }, question('b', 'x'));

    expect(next.entries).toHaveLength(length);
  });
});

describe('enqueueNotice within a group', () => {
  const grouped = (id: string): KkNoticeEntry => ({ ...undoable(id), group: 'undo' });

  it.each<{ name: string; queue: KkNoticeQueue; ids: string[]; isOpen: boolean }>([
    {
      name: 'replaces the shown member in place',
      queue: { entries: [grouped('a'), entry('b')], isOpen: true },
      ids: ['n', 'b'],
      isOpen: true,
    },
    {
      name: 'drops waiting members and queues behind the shown notice',
      queue: { entries: [entry('a'), grouped('b'), entry('c')], isOpen: true },
      ids: ['a', 'c', 'n'],
      isOpen: true,
    },
    {
      name: 'queues behind a leaving member',
      queue: { entries: [grouped('a')], isOpen: false },
      ids: ['a', 'n'],
      isOpen: false,
    },
    { name: 'opens an empty queue', queue: EMPTY_NOTICE_QUEUE, ids: ['n'], isOpen: true },
  ])('$name', ({ queue, ids, isOpen }) => {
    const next = enqueueNotice(queue, grouped('n'));

    expect(next.entries.map((kept) => kept.id)).toEqual(ids);
    expect(next.isOpen).toBe(isOpen);
  });

  it('lets a grouped notice with actions expire', () => {
    expect(noticeLifetimeMs({ entries: [grouped('a')], isOpen: true })).not.toBeNull();
  });
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

describe('leaveScreen', () => {
  it.each<{ name: string; queue: KkNoticeQueue; ids: string[]; isOpen: boolean }>([
    {
      name: 'closes a shown undo and drops waiting ones',
      queue: { entries: [undoable('a'), entry('b'), undoable('c')], isOpen: true },
      ids: ['a', 'b'],
      isOpen: false,
    },
    {
      name: 'keeps a shown plain notice open',
      queue: { entries: [entry('a'), undoable('b')], isOpen: true },
      ids: ['a'],
      isOpen: true,
    },
    { name: 'leaves an empty queue', queue: EMPTY_NOTICE_QUEUE, ids: [], isOpen: false },
  ])('$name', ({ queue, ids, isOpen }) => {
    const left = leaveScreen(queue);

    expect(left.entries.map((kept) => kept.id)).toEqual(ids);
    expect(left.isOpen).toBe(isOpen);
  });
});
