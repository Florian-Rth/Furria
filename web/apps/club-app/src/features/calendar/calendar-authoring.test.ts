import { describe, expect, it } from 'vitest';
import type { MyGroupSummary } from '@/features/group-hub';
import {
  mayOwnCalendarEntry,
  toDayTime,
  toDefaultVisibility,
  toEndKeptInStep,
  toEntryFormValues,
  toEntryLink,
  toEntryPayload,
  toInstant,
  toOwnerOptions,
  toParticipatingGroupChoices,
  toParticipatingGroupIds,
  toTimeChoices,
  toToggledParticipation,
} from './calendar-authoring';
import type { CalendarEntry, CalendarEntryForm } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const group = (overrides: Partial<MyGroupSummary>): MyGroupSummary => ({
  groupId: 1,
  name: 'Tanzgarde',
  isMember: true,
  isAdmin: false,
  ...overrides,
});

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 11,
  title: 'Prunksitzung',
  startsAt: at(2026, 2, 14, 19),
  endsAt: null,
  kind: 'performance',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  visibility: 'club',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...overrides,
});

const form = (overrides: Partial<CalendarEntryForm>): CalendarEntryForm => ({
  title: '  Prunksitzung  ',
  description: '   ',
  ownerId: 'club',
  venueId: '',
  kind: 'meeting',
  visibility: 'club',
  startDay: '2027-01-20',
  startTime: '19:00',
  endDay: '2027-01-20',
  endTime: '22:15',
  asksForResponse: false,
  participatingGroupIds: [],
  ...overrides,
});

const TANZGARDE = group({ groupId: 7, name: 'Tanzgarde', isAdmin: true });
const ELFERRAT = group({ groupId: 3, name: 'Elferrat', isAdmin: true });
const KINDERGARDE = group({ groupId: 9, name: 'Kindergarde', isAdmin: false });

describe('toOwnerOptions', () => {
  it('offers only the groups the viewer administers', () => {
    const options = toOwnerOptions([TANZGARDE, KINDERGARDE], false);

    expect(options.map((option) => option.ownerGroupId)).toEqual([7]);
  });

  it('puts the club first and sorts the groups by name', () => {
    const options = toOwnerOptions([TANZGARDE, ELFERRAT], true);

    expect(options.map((option) => option.ownerGroupId)).toEqual([null, 3, 7]);
  });
});

describe('mayOwnCalendarEntry', () => {
  it('answers for the club and for one group apart', () => {
    const options = toOwnerOptions([TANZGARDE], false);

    expect(mayOwnCalendarEntry(options, { ownerGroupId: 7, kind: 'training' })).toBe(true);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'meeting' })).toBe(false);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: 3, kind: 'training' })).toBe(false);
  });

  it('never hands an event to the calendar editor, not even to the club calendar', () => {
    const options = toOwnerOptions([TANZGARDE], true);

    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'meeting' })).toBe(true);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'event' })).toBe(false);
  });
});

describe('toEntryLink', () => {
  it.each<{
    label: string;
    kind: 'meeting' | 'event';
    owned: boolean;
    managesEvents: boolean;
    to: string | null;
  }>([
    {
      label: 'an owned entry',
      kind: 'meeting',
      owned: true,
      managesEvents: false,
      to: '/calendar/$calendarEntryId',
    },
    { label: 'a foreign entry', kind: 'meeting', owned: false, managesEvents: true, to: null },
    {
      label: 'an event for its keeper',
      kind: 'event',
      owned: false,
      managesEvents: true,
      to: '/events/$eventId',
    },
    { label: 'an event for a member', kind: 'event', owned: false, managesEvents: false, to: null },
    {
      label: 'an event for the club calendar',
      kind: 'event',
      owned: true,
      managesEvents: false,
      to: null,
    },
  ])('opens $label', ({ kind, owned, managesEvents, to }) => {
    const link = toEntryLink(
      { calendarEntryId: 4, ownerGroupId: null, kind },
      owned,
      managesEvents,
    );

    expect(link?.to ?? null).toBe(to);
  });
});

describe('toDefaultVisibility', () => {
  it.each([
    [null, 'meeting', 'club'],
    [7, 'training', 'club'],
    [7, 'performance', 'group'],
  ] as const)('reads owner %s and kind %s as %s', (ownerGroupId, kind, expected) => {
    expect(toDefaultVisibility(ownerGroupId, kind)).toBe(expected);
  });
});

describe('toTimeChoices', () => {
  it('steps through the whole day in quarter hours', () => {
    const choices = toTimeChoices();

    expect(choices).toHaveLength(96);
    expect(choices[0]).toBe('00:00');
    expect(choices[1]).toBe('00:15');
    expect(choices[76]).toBe('19:00');
    expect(choices[95]).toBe('23:45');
  });
});

describe('toInstant', () => {
  it('carries the chosen day and time back out unchanged', () => {
    expect(toDayTime(toInstant('2027-01-20', '19:45'))).toEqual({
      day: '2027-01-20',
      time: '19:45',
    });
  });
});

describe('toEntryPayload', () => {
  it('trims the title and drops an empty description', () => {
    const payload = toEntryPayload(form({}));

    expect(payload.title).toBe('Prunksitzung');
    expect(payload.description).toBeNull();
  });

  it('keeps a description that carries text', () => {
    expect(toEntryPayload(form({ description: '  Kostüm mitbringen. ' })).description).toBe(
      'Kostüm mitbringen.',
    );
  });

  it('reads the club as no owner and a group as its id', () => {
    expect(toEntryPayload(form({ ownerId: 'club' })).ownerGroupId).toBeNull();
    expect(toEntryPayload(form({ ownerId: '7' })).ownerGroupId).toBe(7);
  });

  it('reads no venue as none and a chosen venue as its id', () => {
    expect(toEntryPayload(form({ venueId: '' })).venueId).toBeNull();
    expect(toEntryPayload(form({ venueId: '4' })).venueId).toBe(4);
  });

  it('writes an open end when no last day is chosen', () => {
    expect(toEntryPayload(form({ endDay: '' })).endsAt).toBeNull();
  });

  it('writes both ends from the chosen days and times', () => {
    const payload = toEntryPayload(form({ endDay: '2027-01-21', endTime: '02:30' }));

    expect(toDayTime(payload.startsAt)).toEqual({ day: '2027-01-20', time: '19:00' });
    expect(toDayTime(payload.endsAt ?? '')).toEqual({ day: '2027-01-21', time: '02:30' });
  });
});

describe('toEntryFormValues', () => {
  it('fills in the only possible owner and its default visibility', () => {
    const values = toEntryFormValues(
      null,
      toOwnerOptions([TANZGARDE], false),
      new Date(2027, 0, 20),
    );

    expect(values.ownerId).toBe('7');
    expect(values.visibility).toBe('group');
    expect(values.startDay).toBe('2027-01-20');
  });

  it('reads an open end off an existing calendar entry', () => {
    const values = toEntryFormValues(entry({ endsAt: null }), [], new Date(2027, 0, 20));

    expect(values.endDay).toBe('');
  });

  it('carries the venue of an existing calendar entry into the form', () => {
    const values = toEntryFormValues(entry({ venueId: 4 }), [], new Date(2027, 0, 20));

    expect(values.venueId).toBe('4');
  });
});

describe('toEndKeptInStep', () => {
  it('leaves the end alone while it still lies after the start', () => {
    expect(
      toEndKeptInStep(
        { day: '2027-01-20', time: '19:00' },
        { day: '2027-01-20', time: '20:00' },
        { day: '2027-01-20', time: '21:00' },
      ),
    ).toEqual({ day: '2027-01-20', time: '21:00' });
  });

  it('carries the end along with its span when the start moves past it', () => {
    expect(
      toEndKeptInStep(
        { day: '2027-01-20', time: '19:00' },
        { day: '2027-01-20', time: '22:00' },
        { day: '2027-01-20', time: '21:00' },
      ),
    ).toEqual({ day: '2027-01-21', time: '00:00' });
  });

  it('collapses an end that already lay before its start onto the new start', () => {
    expect(
      toEndKeptInStep(
        { day: '2027-01-20', time: '22:00' },
        { day: '2027-01-20', time: '23:00' },
        { day: '2027-01-20', time: '21:00' },
      ),
    ).toEqual({ day: '2027-01-20', time: '23:00' });
  });
});

describe('toParticipatingGroupChoices', () => {
  const running = {
    state: 'ready',
    groups: [
      { groupId: 3, name: 'Männerballett' },
      { groupId: 1, name: 'Tanzgarde' },
      { groupId: 2, name: 'Ältestenrat' },
    ],
  } as const;

  it.each([
    ['the owner left out', '1', [2, 3]],
    ['every group sorted by name when the club owns', 'club', [2, 3, 1]],
  ])('lists %s', (_case, ownerId, expected) => {
    expect(
      toParticipatingGroupChoices(running, [], ownerId).map((choice) => choice.groupId),
    ).toEqual(expected);
  });

  it('keeps a participating group choosable as archived after it left the directory', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toParticipatingGroupChoices(running, held, 'club')).toContainEqual({
      groupId: 9,
      name: 'Wirbelwinde',
      isArchived: true,
    });
  });

  it('calls no held group archived while the directory is missing', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toParticipatingGroupChoices({ state: 'failed' }, held, 'club')).toEqual([
      { groupId: 9, name: 'Wirbelwinde', isArchived: false },
    ]);
  });

  it('lists a held group once when it is still in the directory', () => {
    const held = [{ groupId: 1, name: 'Tanzgarde' }];

    expect(toParticipatingGroupChoices(running, held, 'club')).toHaveLength(3);
  });
});

describe('toParticipatingGroupIds', () => {
  it.each([
    [['2', '2', '3'], 'club', [2, 3]],
    [['1', '2'], '1', [2]],
  ])('maps %s under owner %s', (values, ownerId, expected) => {
    expect(toParticipatingGroupIds(values, ownerId)).toEqual(expected);
  });
});

describe('toToggledParticipation', () => {
  it.each([
    [['2'], '3', ['2', '3']],
    [['2', '3'], '3', ['2']],
  ])('toggles %s with %s', (values, value, expected) => {
    expect(toToggledParticipation(values, value)).toEqual(expected);
  });
});
