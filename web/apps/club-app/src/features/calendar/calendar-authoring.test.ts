import { describe, expect, it } from 'vitest';
import type { MyGroupSummary } from '@/features/group-hub/schemas';
import { toDayTime } from '@/lib/day';
import {
  mayOwnCalendarEntry,
  NO_DRAFT,
  opensEntrySheet,
  toAddedEnd,
  toAudienceAfterOwnerChange,
  toAudienceGroupIds,
  toAudienceSwitch,
  toCalendarAudience,
  toDefaultAudience,
  toEndKeptInStep,
  toEndSpanLabel,
  toEntryDraft,
  toEntryFormValues,
  toEntryLanding,
  toEntryLink,
  toEntryPayload,
  toGroupChoices,
  toOwnerOptions,
  toParticipatingGroupIds,
  toToggledValue,
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
  kind: 'trip',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  audiencePeople: [],
  asksForResponse: false,
  addOns: [],
  responseCount: 0,
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
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'plain' })).toBe(false);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: 3, kind: 'training' })).toBe(false);
  });

  it('never hands an event to the calendar editor, not even to the club calendar', () => {
    const options = toOwnerOptions([TANZGARDE], true);

    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'plain' })).toBe(true);
    expect(mayOwnCalendarEntry(options, { ownerGroupId: null, kind: 'event' })).toBe(false);
  });
});

describe('toEntryLink', () => {
  it.each<{ label: string; kind: 'plain' | 'event'; owned: boolean; to: string | null }>([
    { label: 'an owned entry', kind: 'plain', owned: true, to: '/calendar/$calendarEntryId' },
    { label: 'a foreign entry', kind: 'plain', owned: false, to: null },
    { label: 'an event of the club calendar', kind: 'event', owned: true, to: null },
  ])('opens $label', ({ kind, owned, to }) => {
    const link = toEntryLink({ calendarEntryId: 4, ownerGroupId: null, kind }, owned);

    expect(link?.to ?? null).toBe(to);
  });
});

describe('opensEntrySheet', () => {
  it.each([
    ['event', true],
    ['plain', false],
    ['training', false],
  ] as const)('opens a %s in the entry sheet: %s', (kind, opens) => {
    expect(opensEntrySheet({ kind })).toBe(opens);
  });
});

describe('toDefaultAudience', () => {
  it.each([
    ['club', 'club'],
    ['7', 'groups'],
  ] as const)('reads owner %s as audience %s', (ownerId, expected) => {
    expect(toDefaultAudience(ownerId)).toBe(expected);
  });
});

describe('toAudienceSwitch', () => {
  it.each([
    ['7', [], 'groups', ['7']],
    ['club', [], 'groups', []],
    ['7', ['4'], 'groups', ['4']],
    ['7', [], 'people', []],
  ] as const)(
    'switches owner %s with held groups %j to %s with groups %j',
    (ownerId, held, audience, expected) => {
      expect(toAudienceSwitch({ ownerId, audienceGroupIds: [...held] }, audience)).toEqual({
        audience,
        audienceGroupIds: expected,
      });
    },
  );
});

describe('toAudienceAfterOwnerChange', () => {
  it.each([
    ['club', 'club', [], '7', 'groups', ['7']],
    ['7', 'club', [], '9', 'club', []],
    ['7', 'groups', ['7'], '9', 'groups', ['9']],
    ['7', 'groups', ['7'], 'club', 'groups', ['7']],
    ['7', 'groups', [], 'club', 'groups', ['7']],
    ['7', 'groups', ['7', '4'], '9', 'groups', ['7', '4']],
    ['7', 'people', [], 'club', 'people', []],
  ] as const)(
    'moves owner %s with audience %s and groups %j to owner %s as %s %j',
    (ownerId, audience, held, nextOwnerId, expectedAudience, expectedGroups) => {
      expect(
        toAudienceAfterOwnerChange({ ownerId, audience, audienceGroupIds: [...held] }, nextOwnerId),
      ).toEqual({ audience: expectedAudience, audienceGroupIds: expectedGroups });
    },
  );
});

describe('toCalendarAudience', () => {
  it.each([
    ['groups', 'groups'],
    ['public', null],
  ] as const)('reads %s as %s', (value, expected) => {
    expect(toCalendarAudience(value)).toBe(expected);
  });
});

describe('audience round trip', () => {
  it.each([
    [
      {
        audience: 'groups',
        audienceGroups: [
          { groupId: 3, name: 'A', tone: null },
          { groupId: 9, name: 'B', tone: null },
        ],
      },
      [3, 9],
      [],
    ],
    [
      {
        audience: 'people',
        audiencePeople: [
          { personId: 4, firstName: 'A', lastName: 'B' },
          { personId: 5, firstName: 'C', lastName: 'D' },
        ],
      },
      [],
      [4, 5],
    ],
  ] as const)(
    'sends an edited entry back with its audience %#',
    (overrides, groupIds, personIds) => {
      const payload = toEntryPayload(
        toEntryFormValues(
          entry({
            ownerGroupId: 7,
            ...overrides,
            audienceGroups: 'audienceGroups' in overrides ? [...overrides.audienceGroups] : [],
            audiencePeople: 'audiencePeople' in overrides ? [...overrides.audiencePeople] : [],
          }),
          [],
          '2027-01-20',
          NO_DRAFT,
        ),
      );

      expect([payload.audienceGroupIds, payload.audiencePersonIds]).toEqual([groupIds, personIds]);
    },
  );
});

describe('toAudienceGroupIds', () => {
  it.each([
    ['club', ['7'], []],
    ['groups', ['7', '9'], [7, 9]],
    ['people', ['4'], []],
  ] as const)('sends audience %s with held groups %j as %j', (audience, held, expected) => {
    expect(toAudienceGroupIds({ audience, audienceGroupIds: [...held] })).toEqual(expected);
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

  it.each([
    [[], ['3'], [], []],
    [['participatingGroups'], ['3', '3', '7'], ['participatingGroups'], [3]],
    [['attendance', 'participatingGroups'], ['3'], ['attendance', 'participatingGroups'], [3]],
  ] as const)(
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
  it('fills in the only possible owner and its default audience', () => {
    const values = toEntryFormValues(
      null,
      toOwnerOptions([TANZGARDE], false),
      '2027-01-20',
      NO_DRAFT,
    );

    expect(values.ownerId).toBe('7');
    expect(values.audience).toBe('groups');
    expect(values.audienceGroupIds).toEqual(['7']);
    expect(values.startDay).toBe('2027-01-20');
  });

  it('keeps the add-ons of an existing calendar entry in their order', () => {
    const values = toEntryFormValues(
      entry({
        addOns: [{ kind: 'participatingGroups' }, { kind: 'attendance' }],
      }),
      [],
      '2027-01-20',
      NO_DRAFT,
    );

    expect(values.addOns.map((card) => card.kind)).toEqual(['participatingGroups', 'attendance']);
  });

  it('reads an open end off an existing calendar entry', () => {
    const values = toEntryFormValues(entry({ endsAt: null }), [], '2027-01-20', NO_DRAFT);

    expect(values.endDay).toBe('');
  });

  it('carries the venue of an existing calendar entry into the form', () => {
    const values = toEntryFormValues(entry({ venueId: 4 }), [], '2027-01-20', NO_DRAFT);

    expect(values.venueId).toBe('4');
  });

  it('plans a training of the drafted group at the drafted time and place', () => {
    const values = toEntryFormValues(
      null,
      toOwnerOptions([group({ groupId: 3, name: 'Altgarde', isAdmin: true }), TANZGARDE], true),
      '2027-01-19',
      {
        ownerGroupId: 7,
        kind: 'training',
        startTime: '19:30',
        endTime: '21:00',
        venueId: 2,
        returnGroupId: null,
      },
    );

    expect([
      values.ownerId,
      values.kind,
      values.audience,
      values.startTime,
      values.endDay,
      values.endTime,
      values.venueId,
      values.title.length > 0,
    ]).toEqual(['7', 'training', 'groups', '19:30', '2027-01-19', '21:00', '2', true]);
  });

  it('starts a new entry without an end unless the draft brings one', () => {
    const values = toEntryFormValues(
      null,
      toOwnerOptions([TANZGARDE], false),
      '2027-01-19',
      NO_DRAFT,
    );

    expect([values.endDay, values.endTime]).toEqual(['', '']);
  });

  it('starts a new entry as a plain entry', () => {
    const values = toEntryFormValues(
      null,
      toOwnerOptions([TANZGARDE], false),
      '2027-01-19',
      NO_DRAFT,
    );

    expect(values.kind).toBe('plain');
  });

  it('ends a drafted training on the next day when it runs past midnight', () => {
    const values = toEntryFormValues(null, toOwnerOptions([TANZGARDE], false), '2027-01-19', {
      ...NO_DRAFT,
      startTime: '22:30',
      endTime: '00:30',
    });

    expect(values.endDay).toBe('2027-01-20');
  });

  it('falls back to the first owner when the drafted group is not hers', () => {
    const values = toEntryFormValues(null, toOwnerOptions([TANZGARDE], false), '2027-01-19', {
      ...NO_DRAFT,
      ownerGroupId: 99,
    });

    expect(values.ownerId).toBe('7');
  });
});

describe('toEntryDraft', () => {
  it.each([
    [{}, NO_DRAFT],
    [{ kind: 'event' }, NO_DRAFT],
    [
      { group: 7, kind: 'training', start: '19:30', end: '21:00', venue: 2 },
      {
        ownerGroupId: 7,
        kind: 'training',
        startTime: '19:30',
        endTime: '21:00',
        venueId: 2,
        returnGroupId: null,
      },
    ],
    [
      { group: 7, back: 'group' },
      { ...NO_DRAFT, ownerGroupId: 7, returnGroupId: 7 },
    ],
  ])('reads %o into a draft', (search, draft) => {
    expect(toEntryDraft(search)).toEqual(draft);
  });
});

describe('toEntryLanding', () => {
  it.each([
    [NO_DRAFT, '/calendar'],
    [{ ...NO_DRAFT, ownerGroupId: 7, returnGroupId: 7 }, '/groups/$groupId'],
  ])('lands a draft back where it was planned', (draft, to) => {
    expect(toEntryLanding(31, '2027-01-19', draft).to).toBe(to);
  });
});

describe('toEndKeptInStep', () => {
  it.each([
    {
      previous: { day: '2027-01-20', time: '19:00' },
      next: { day: '2027-01-20', time: '20:00' },
      end: { day: '2027-01-20', time: '21:00' },
      expected: { day: '2027-01-20', time: '22:00' },
    },
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
    { start: { day: '2027-01-20', time: '19:00' }, expected: { day: '2027-01-20', time: '21:00' } },
    { start: { day: '2027-01-20', time: '23:11' }, expected: { day: '2027-01-21', time: '01:11' } },
  ])('ends $start two hours later', ({ start, expected }) => {
    expect(toAddedEnd(start)).toEqual(expected);
  });
});

describe('toEndSpanLabel', () => {
  it.each([
    { end: { day: '2027-01-20', time: '21:00' }, expected: '2 Std.' },
    { end: { day: '2027-01-20', time: '20:30' }, expected: '1 Std. 30 Min.' },
    { end: { day: '2027-01-20', time: '19:45' }, expected: '45 Min.' },
    { end: { day: '2027-01-21', time: '02:00' }, expected: '7 Std.' },
    { end: { day: '2027-01-22', time: '14:00' }, expected: '3 Tage' },
    { end: { day: '2027-01-20', time: '19:00' }, expected: null },
    { end: { day: '2027-01-20', time: '18:00' }, expected: null },
  ])('labels the span to $end as $expected', ({ end, expected }) => {
    expect(toEndSpanLabel({ day: '2027-01-20', time: '19:00' }, end)).toBe(expected);
  });
});

describe('toGroupChoices', () => {
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
    ['every group sorted by name when nothing is left out', null, [2, 3, 1]],
  ])('lists %s', (_case, ownerId, expected) => {
    expect(toGroupChoices(running, [], ownerId).map((choice) => choice.groupId)).toEqual(expected);
  });

  it('keeps a participating group choosable as archived after it left the directory', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toGroupChoices(running, held, 'club')).toContainEqual({
      groupId: 9,
      name: 'Wirbelwinde',
      isArchived: true,
    });
  });

  it('calls no held group archived while the directory is missing', () => {
    const held = [{ groupId: 9, name: 'Wirbelwinde' }];

    expect(toGroupChoices({ state: 'failed' }, held, 'club')).toEqual([
      { groupId: 9, name: 'Wirbelwinde', isArchived: false },
    ]);
  });

  it('lists a held group once when it is still in the directory', () => {
    const held = [{ groupId: 1, name: 'Tanzgarde' }];

    expect(toGroupChoices(running, held, 'club')).toHaveLength(3);
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

describe('toToggledValue', () => {
  it.each([
    [['2'], '3', ['2', '3']],
    [['2', '3'], '3', ['2']],
  ])('toggles %s with %s', (values, value, expected) => {
    expect(toToggledValue(values, value)).toEqual(expected);
  });
});
