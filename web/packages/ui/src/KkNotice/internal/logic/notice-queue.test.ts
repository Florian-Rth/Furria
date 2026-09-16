import { describe, expect, it } from 'vitest';
import type { KkNoticeEntry, KkNoticeQueue } from './notice-queue';
import {
  awaitsAnswer,
  closeNotice,
  currentNotice,
  EMPTY_NOTICE_QUEUE,
  enqueueNotice,
  finishNoticeExit,
  noticeLifetimeMs,
} from './notice-queue';

const entry = (id: string): KkNoticeEntry => ({ id, tone: 'success', message: `Hinweis ${id}` });

const showing = (...ids: readonly string[]): KkNoticeQueue => ({
  entries: ids.map(entry),
  isOpen: true,
});

describe('enqueueNotice', () => {
  it('opens the region for the first notice', () => {
    expect(enqueueNotice(EMPTY_NOTICE_QUEUE, entry('a'))).toEqual({
      entries: [entry('a')],
      isOpen: true,
    });
  });

  it('queues behind a notice that is already showing', () => {
    const queue = enqueueNotice(showing('a'), entry('b'));

    expect(queue.isOpen).toBe(true);
    expect(currentNotice(queue)).toEqual(entry('a'));
    expect(queue.entries).toHaveLength(2);
  });

  it('does not reopen a notice that is still leaving', () => {
    const leaving: KkNoticeQueue = { entries: [entry('a')], isOpen: false };

    expect(enqueueNotice(leaving, entry('b')).isOpen).toBe(false);
  });
});

describe('closeNotice', () => {
  it('keeps the entry so the exit can play out', () => {
    expect(closeNotice(showing('a', 'b'))).toEqual({
      entries: [entry('a'), entry('b')],
      isOpen: false,
    });
  });
});

describe('finishNoticeExit', () => {
  it('drops the notice that left and opens the next one', () => {
    const queue = finishNoticeExit({ entries: [entry('a'), entry('b')], isOpen: false });

    expect(queue).toEqual({ entries: [entry('b')], isOpen: true });
  });

  it('closes the region when the last notice has left', () => {
    expect(finishNoticeExit({ entries: [entry('a')], isOpen: false })).toEqual(EMPTY_NOTICE_QUEUE);
  });

  it('stays empty when nothing is queued', () => {
    expect(finishNoticeExit(EMPTY_NOTICE_QUEUE)).toEqual(EMPTY_NOTICE_QUEUE);
  });

  it('drains three notices in arrival order', () => {
    const first = enqueueNotice(
      enqueueNotice(enqueueNotice(EMPTY_NOTICE_QUEUE, entry('a')), entry('b')),
      entry('c'),
    );
    const second = finishNoticeExit(closeNotice(first));
    const third = finishNoticeExit(closeNotice(second));

    expect(currentNotice(first)).toEqual(entry('a'));
    expect(currentNotice(second)).toEqual(entry('b'));
    expect(currentNotice(third)).toEqual(entry('c'));
    expect(third.isOpen).toBe(true);
  });
});

describe('currentNotice', () => {
  it('has nothing to show while the queue is empty', () => {
    expect(currentNotice(EMPTY_NOTICE_QUEUE)).toBeNull();
  });
});

describe('awaitsAnswer', () => {
  it.each([
    ['a bare confirmation', { tone: 'success', message: 'Gespeichert' }, false],
    ['rows to read', { tone: 'error', message: 'Keine Verbindung', detail: ['Später mehr'] }, true],
    [
      'something to do',
      {
        tone: 'error',
        message: 'Keine Verbindung',
        actions: [{ id: 'retry', label: 'Erneut', onSelect: (): void => {} }],
      },
      true,
    ],
  ] as const)('sees %s', (_case, notice, expected) => {
    expect(awaitsAnswer(notice)).toBe(expected);
  });
});

describe('noticeLifetimeMs', () => {
  it('gives an error longer than a confirmation', () => {
    const confirmation = noticeLifetimeMs(showing('a'));
    const failure = noticeLifetimeMs({
      entries: [{ id: 'b', tone: 'error', message: 'Das ging schief' }],
      isOpen: true,
    });

    expect(confirmation).not.toBeNull();
    expect(Number(failure)).toBeGreaterThan(Number(confirmation));
  });

  it('never expires a notice that carries rows or actions', () => {
    const queue: KkNoticeQueue = {
      entries: [{ id: 'a', tone: 'error', message: 'Keine Verbindung', detail: ['Offline'] }],
      isOpen: true,
    };

    expect(noticeLifetimeMs(queue)).toBeNull();
  });

  it('does not run while the region is closed', () => {
    expect(noticeLifetimeMs({ entries: [entry('a')], isOpen: false })).toBeNull();
  });

  it('has nothing to count while the queue is empty', () => {
    expect(noticeLifetimeMs(EMPTY_NOTICE_QUEUE)).toBeNull();
  });
});
