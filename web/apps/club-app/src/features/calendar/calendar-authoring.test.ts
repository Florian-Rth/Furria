import { describe, expect, it } from 'vitest';
import type { MyGroupSummary } from '@/features/group-hub/schemas';
import { toDayTime } from '@/lib/day';
import {
  mayOwnCalendarEntry,
  NO_DRAFT,
  toAddedEnd,
  toEndKeptInStep,
  toEntryFormValues,
  toEntryPayload,
  toOwnerOptions,
  toParticipatingGroupIds,
} from './calendar-authoring';
import type { CalendarEntryForm } from './schemas';

const group = (overrides: Partial<MyGroupSummary>): MyGroupSummary => ({
  groupId: 1,
  name: 'Tanzgarde',
  isMember: true,
  isAdmin: false,
  ...overrides,
});

const form = (overrides: Partial<CalendarEntryForm>): CalendarEntryForm => ({
  title: '  Prunksitzung  ',
  description: '   ',
  ownerId: 'club',
  venueId: '',
  kind: 'plain',
  audience: 'club',
  audienceGroupIds: [],
  audiencePersonIds: [],
  startDay: '2027-01-20',
  startTime: '19:00',
  endDay: '2027-01-20',
  endTime: '22:15',
  addOns: [],
  participatingGroupIds: [],
  notify: false,
  ...overrides,
});

const TANZGARDE = group({ groupId: 7, name: 'Tanzgarde', isAdmin: true });
const KINDERGARDE = group({ groupId: 9, name: 'Kindergarde', isAdmin: false });

describe('toOwnerOptions', () => {
  it('offers only the groups the viewer administers', () => {
    const options = toOwnerOptions([TANZGARDE, KINDERGARDE], false);

    expect(options.map((option) => option.ownerGroupId)).toEqual([7]);
  });
});

describe('mayOwnCalendarEntry', () => {
  it('answers for the club and for one group apart', () => {
    const options = toOwnerOptions([TANZGARDE], false);

    expect(mayOwnCalendarEntry(options, { ownerGroupId: 7, kind: 'training' })).toBe(true);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'plain' })).toBe(false);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: 3, kind: 'training' })).toBe(false);
  });

  it('never hands an event to the calendar editor, not even to the club calendar', () => {
    const options = toOwnerOptions([TANZGARDE], true);

    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'plain' })).toBe(true);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'event' })).toBe(false);
  });
});

describe('toEntryPayload', () => {
  it.each([[['participatingGroups'], ['3', '3', '7'], ['participatingGroups'], [3]]] as const)(
    'sends add-ons %j with groups %j as %j and %j',
    (kinds, groupIds, expectedKinds, expectedGroupIds) => {
      const payload = toEntryPayload(
        form({
          ownerId: '7',
          addOns: kinds.map((kind) => ({ key: kind, kind })),
          participatingGroupIds: [...groupIds],
        }),
      );

      expect([payload.addOns.map((addOn) => addOn.kind), payload.participatingGroupIds]).toEqual([
        expectedKinds,
        expectedGroupIds,
      ]);
    },
  );

  it('writes both ends from the chosen days and times', () => {
    const payload = toEntryPayload(form({ endDay: '2027-01-21', endTime: '02:30' }));

    expect(toDayTime(payload.startsAt)).toEqual({ day: '2027-01-20', time: '19:00' });
    expect(toDayTime(payload.endsAt ?? '')).toEqual({ day: '2027-01-21', time: '02:30' });
  });
});

describe('toEntryFormValues', () => {
  it('ends a drafted training on the next day when it runs past midnight', () => {
    const values = toEntryFormValues(null, toOwnerOptions([TANZGARDE], false), '2027-01-19', {
      ...NO_DRAFT,
      startTime: '22:30',
      endTime: '00:30',
    });

    expect(values.endDay).toBe('2027-01-20');
  });

  it('never drafts a training for the club', () => {
    const values = toEntryFormValues(null, toOwnerOptions([TANZGARDE], true), '2027-01-19', {
      ...NO_DRAFT,
      kind: 'training',
    });

    expect([values.audience, values.audienceGroupIds, values.ownerId]).toEqual([
      'groups',
      [],
      'club',
    ]);
  });
});

describe('toEndKeptInStep', () => {
  it.each([
    {
      previous: { day: '2027-01-20', time: '19:00' },
      next: { day: '2027-01-20', time: '22:00' },
      end: { day: '2027-01-20', time: '21:00' },
      expected: { day: '2027-01-21', time: '00:00' },
    },
    {
      previous: { day: '2027-01-20', time: '19:00' },
      next: { day: '2027-01-18', time: '19:00' },
      end: { day: '2027-01-22', time: '14:00' },
      expected: { day: '2027-01-20', time: '14:00' },
    },
    {
      previous: { day: '2027-01-20', time: '22:00' },
      next: { day: '2027-01-20', time: '23:00' },
      end: { day: '2027-01-20', time: '21:00' },
      expected: { day: '2027-01-20', time: '23:00' },
    },
  ])('moves the end from $end with the start to $expected', ({ previous, next, end, expected }) => {
    expect(toEndKeptInStep(previous, next, end)).toEqual(expected);
  });
});

describe('toAddedEnd', () => {
  it.each([
    { start: { day: '2027-01-20', time: '23:11' }, expected: { day: '2027-01-21', time: '01:11' } },
  ])('ends $start two hours later', ({ start, expected }) => {
    expect(toAddedEnd(start)).toEqual(expected);
  });
});

describe('toParticipatingGroupIds', () => {
  it.each([[['1', '2'], '1', [2]]])('maps %s under owner %s', (values, ownerId, expected) => {
    expect(toParticipatingGroupIds(values, ownerId)).toEqual(expected);
  });
});
