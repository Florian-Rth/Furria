import { describe, expect, it } from 'vitest';
import type { MyGroupSummary } from '@/features/group-hub';
import {
  findCalendarEntry,
  mayOwnCalendarEntry,
  toCalendarEntryIdParam,
  toCalendarKind,
  toCalendarVisibility,
  toCollisionSentence,
  toDayTime,
  toDefaultVisibility,
  toEndKeptInStep,
  toEntryFormValues,
  toEntryPayload,
  toEntryWriteNotice,
  toInstant,
  toOwnerOptions,
  toParticipantPool,
  toParticipantsEmptyLabel,
  toParticipatingGroupIds,
  toParticipatingGroupOptions,
  toParticipationKeptForOwner,
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

  it('offers nothing when the viewer owns neither the club nor a group', () => {
    expect(toOwnerOptions([KINDERGARDE], false)).toEqual([]);
  });
});

describe('mayOwnCalendarEntry', () => {
  it('answers for the club and for one group apart', () => {
    const options = toOwnerOptions([TANZGARDE], false);

    expect(mayOwnCalendarEntry(options, 7)).toBe(true);
    expect(mayOwnCalendarEntry(options, null)).toBe(false);
    expect(mayOwnCalendarEntry(options, 3)).toBe(false);
  });
});

describe('toDefaultVisibility', () => {
  it.each([
    [null, 'meeting', 'club'],
    [null, 'training', 'club'],
    [7, 'training', 'club'],
    [7, 'performance', 'group'],
    [7, 'party', 'group'],
  ] as const)('reads owner %s and kind %s as %s', (ownerGroupId, kind, expected) => {
    expect(toDefaultVisibility(ownerGroupId, kind)).toBe(expected);
  });
});

describe('toCalendarKind', () => {
  it.each([
    ['training', 'training'],
    ['party', 'party'],
    ['nonsense', 'other'],
  ])('reads %s as %s', (value, expected) => {
    expect(toCalendarKind(value)).toBe(expected);
  });
});

describe('toCalendarVisibility', () => {
  it.each([
    ['group', 'group'],
    ['public', 'public'],
    ['nonsense', 'club'],
  ])('reads %s as %s', (value, expected) => {
    expect(toCalendarVisibility(value)).toBe(expected);
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

describe('toCollisionSentence', () => {
  it('says nothing when no calendar entry clashes', () => {
    expect(toCollisionSentence([])).toBeNull();
  });

  it('names the one calendar entry that clashes', () => {
    expect(toCollisionSentence(['„Abendprobe“ (20.01. 18:00 – 21:00 Uhr)'])).toContain(
      '„Abendprobe“ (20.01. 18:00 – 21:00 Uhr)',
    );
  });

  it('names every calendar entry that clashes', () => {
    const sentence = toCollisionSentence(['„Abendprobe“', '„Bastelabend“']) ?? '';

    expect(sentence).toContain('„Abendprobe“');
    expect(sentence).toContain('„Bastelabend“');
  });
});

describe('toCalendarEntryIdParam', () => {
  it.each([
    ['11', 11],
    ['0', null],
    ['-3', null],
    ['abc', null],
  ])('reads %s as %s', (raw, expected) => {
    expect(toCalendarEntryIdParam(raw)).toBe(expected);
  });
});

describe('toEntryWriteNotice', () => {
  it('reads success plainly when nothing clashes', () => {
    expect(toEntryWriteNotice('„Prunksitzung“ steht jetzt im Kalender.', [])).toEqual({
      tone: 'success',
      message: '„Prunksitzung“ steht jetzt im Kalender.',
    });
  });

  it('appends the clash as info without hiding that the save went through', () => {
    const notice = toEntryWriteNotice('„Prunksitzung“ steht jetzt im Kalender.', [
      { calendarEntryId: 9, title: 'Abendprobe', startsAt: at(2026, 2, 14, 18), endsAt: null },
    ]);

    expect(notice.tone).toBe('info');
    expect(notice.message).toContain('„Prunksitzung“ steht jetzt im Kalender.');
    expect(notice.message).toContain('Abendprobe');
  });
});

describe('findCalendarEntry', () => {
  it('finds nothing when no calendar entry is targeted', () => {
    expect(findCalendarEntry([entry({})], null)).toBeNull();
  });

  it('finds nothing when the targeted calendar entry is gone', () => {
    expect(findCalendarEntry([entry({ calendarEntryId: 11 })], 12)).toBeNull();
  });

  it('finds the targeted calendar entry', () => {
    const found = findCalendarEntry(
      [entry({ calendarEntryId: 11 }), entry({ calendarEntryId: 12 })],
      12,
    );

    expect(found?.calendarEntryId).toBe(12);
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

  it('carries the end over the day boundary when the start moves to another day', () => {
    expect(
      toEndKeptInStep(
        { day: '2027-01-20', time: '19:00' },
        { day: '2027-01-22', time: '19:00' },
        { day: '2027-01-20', time: '21:00' },
      ),
    ).toEqual({ day: '2027-01-22', time: '21:00' });
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

describe('toParticipatingGroupOptions', () => {
  const running = {
    state: 'ready',
    groups: [
      { groupId: 3, name: 'Männerballett' },
      { groupId: 1, name: 'Tanzgarde' },
      { groupId: 2, name: 'Ältestenrat' },
    ],
  } as const;

  it('leaves the owner out of the list', () => {
    expect(toParticipatingGroupOptions(running, [], '1')).toEqual([
      { value: '2', label: 'Ältestenrat' },
      { value: '3', label: 'Männerballett' },
    ]);
  });

  it('keeps every group when the club owns the calendar entry', () => {
    expect(toParticipatingGroupOptions(running, [], 'club').map((option) => option.label)).toEqual([
      'Ältestenrat',
      'Männerballett',
      'Tanzgarde',
    ]);
  });

  it('keeps a participating group choosable after it left the directory', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toParticipatingGroupOptions(running, held, 'club')).toContainEqual({
      value: '9',
      label: 'Wirbelwinde — archiviert',
    });
  });

  it('calls no held group archived while the directory is missing', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toParticipatingGroupOptions({ state: 'failed' }, held, 'club')).toEqual([
      { value: '9', label: 'Wirbelwinde' },
    ]);
  });

  it('lists a held group once when it is still in the directory', () => {
    const held = [{ groupId: 1, name: 'Tanzgarde' }];

    expect(toParticipatingGroupOptions(running, held, 'club')).toHaveLength(3);
  });
});

describe('toParticipantPool', () => {
  it('reads loaded groups as ready', () => {
    expect(toParticipantPool([{ groupId: 1, name: 'Tanzgarde' }])).toEqual({
      state: 'ready',
      groups: [{ groupId: 1, name: 'Tanzgarde' }],
    });
  });

  it('reads a missing directory as failed', () => {
    expect(toParticipantPool(undefined).state).toBe('failed');
  });
});

describe('toParticipantsEmptyLabel', () => {
  it('states no group is left only once the directory is there', () => {
    const ready = toParticipantsEmptyLabel({ state: 'ready', groups: [] });

    expect(ready).not.toBe(toParticipantsEmptyLabel({ state: 'failed' }));
  });
});

describe('toParticipatingGroupIds', () => {
  it.each([
    [['2', '3'], 'club', [2, 3]],
    [['2', '2', '3'], 'club', [2, 3]],
    [['1', '2'], '1', [2]],
    [[], 'club', []],
  ])('maps %s under owner %s', (values, ownerId, expected) => {
    expect(toParticipatingGroupIds(values, ownerId)).toEqual(expected);
  });
});

describe('toParticipationKeptForOwner', () => {
  it.each([
    [['1', '2'], '1', ['2']],
    [['2', '3'], '1', ['2', '3']],
    [['2'], 'club', ['2']],
  ])('drops the new owner %s from %s', (values, ownerId, expected) => {
    expect(toParticipationKeptForOwner(values, ownerId)).toEqual(expected);
  });
});

describe('toToggledParticipation', () => {
  it.each([
    [['2'], '3', ['2', '3']],
    [['2', '3'], '3', ['2']],
    [[], '2', ['2']],
  ])('toggles %s with %s', (values, value, expected) => {
    expect(toToggledParticipation(values, value)).toEqual(expected);
  });
});

describe('toEntryPayload participating groups', () => {
  it('maps the chosen ids to numbers', () => {
    expect(
      toEntryPayload(form({ participatingGroupIds: ['2', '3'] })).participatingGroupIds,
    ).toEqual([2, 3]);
  });

  it('drops the owner from the participants', () => {
    expect(
      toEntryPayload(form({ ownerId: '2', participatingGroupIds: ['2', '3'] }))
        .participatingGroupIds,
    ).toEqual([3]);
  });

  it('sends no participating group when none is chosen', () => {
    expect(toEntryPayload(form({})).participatingGroupIds).toEqual([]);
  });
});

describe('toEntryFormValues participating groups', () => {
  it('starts an empty calendar entry without participating groups', () => {
    expect(toEntryFormValues(null, [], new Date(2027, 0, 20)).participatingGroupIds).toEqual([]);
  });

  it('reads the participants of an existing calendar entry as string ids', () => {
    const values = toEntryFormValues(
      entry({
        participatingGroups: [
          { groupId: 2, name: 'Kindergarde', tone: null },
          { groupId: 3, name: 'Männerballett', tone: 'teal' },
        ],
      }),
      [],
      new Date(2027, 0, 20),
    );

    expect(values.participatingGroupIds).toEqual(['2', '3']);
  });
});
