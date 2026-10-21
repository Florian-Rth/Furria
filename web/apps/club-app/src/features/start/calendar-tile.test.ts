import { describe, expect, it } from 'vitest';
import { answerTallyOf, owedEntriesOf, splitCalendar, toEntryMark } from './calendar-tile';
import type { StartEntry } from './schemas';

const entry = (calendarEntryId: number, attendance: StartEntry['attendance']): StartEntry => ({
  calendarEntryId,
  title: 'Generalprobe',
  kind: 'rehearsal',
  startsAt: '2026-10-25T19:00:00+01:00',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance,
  description: null,
  event: null,
});

const owed = entry(1, { viewerAnswer: null, isOwed: true });
const yes = entry(2, { viewerAnswer: 'yes', isOwed: false });
const maybe = entry(3, { viewerAnswer: 'maybe', isOwed: true });
const open = entry(4, { viewerAnswer: null, isOwed: false });
const plain = entry(5, null);

describe('toEntryMark', () => {
  it.each([
    [owed, 'owed'],
    [yes, 'yes'],
    [maybe, 'maybe'],
    [open, null],
    [plain, null],
  ])('marks entry %#', (subject, expected) => {
    expect(toEntryMark(subject)).toBe(expected);
  });
});

describe('answerTallyOf', () => {
  it('counts owed and answered entries apart', () => {
    expect(answerTallyOf([owed, yes, maybe, open, plain])).toEqual({ owed: 1, answered: 2 });
  });
});

describe('owedEntriesOf', () => {
  it('keeps only entries still waiting for an answer', () => {
    expect(owedEntriesOf([owed, yes, open]).map((subject) => subject.calendarEntryId)).toEqual([1]);
  });
});

describe('splitCalendar', () => {
  it.each([
    [[], 5, null, [], 0],
    [[owed], 5, 1, [], 0],
    [[owed, yes, maybe], 5, 1, [2, 3], 0],
    [[owed, yes, maybe, open, plain], 5, 1, [2, 3, 4, 5], 0],
    [[owed, yes, maybe, open, plain], 3, 1, [2, 3], 2],
    [[owed, yes], 0, null, [], 2],
  ])('splits %# within the server cap', (entries, shownCount, lead, next, further) => {
    const split = splitCalendar(entries, shownCount);

    expect({
      lead: split.lead?.calendarEntryId ?? null,
      next: split.next.map((subject) => subject.calendarEntryId),
      further: split.further,
    }).toEqual({ lead, next, further });
  });
});
