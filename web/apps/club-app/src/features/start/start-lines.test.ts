import { describe, expect, it } from 'vitest';
import type { StartAnnouncement, StartEntry, StartMine, StartToDo } from './schemas';
import type { MineLineContext } from './start-lines';
import {
  formatDayMonth,
  formatFullDay,
  formatPastDay,
  isElevenFold,
  TO_DO_LABELS,
  toAnnouncementLine,
  toCalendarTick,
  toEntryLineState,
  toEntryMeta,
  toEntryTrailing,
  toGroupMomentLine,
  toMineLine,
  toToDoLabel,
  toValidUntilLine,
} from './start-lines';

const mine = (overrides: Partial<StartMine>): StartMine => ({
  kind: 'newRole',
  subjectId: 7,
  on: '2027-01-18',
  until: '2027-01-31',
  name: 'Kassenwart',
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: null,
  permissionKeys: null,
  ...overrides,
});

const entry = (overrides: Partial<StartEntry>): StartEntry => ({
  calendarEntryId: 811,
  title: 'Stellprobe',
  kind: 'rehearsal',
  startsAt: '2027-01-21T17:00:00Z',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: null,
  description: null,
  ...overrides,
});

const MEMBER: MineLineContext = { today: '2027-01-19', canReadClub: true, memberSince: null };

describe('formatDayMonth', () => {
  it.each([
    ['2027-12-31', '31.12.'],
    ['2027-02-08', '8.2.'],
  ])('formats %s as %s', (isoDay, expected) => {
    expect(formatDayMonth(isoDay)).toBe(expected);
  });
});

describe('formatFullDay', () => {
  it.each([
    ['1994-03-01', '1.3.1994'],
    ['2001-11-11', '11.11.2001'],
  ])('formats %s as %s', (isoDay, expected) => {
    expect(formatFullDay(isoDay)).toBe(expected);
  });
});

describe('formatPastDay', () => {
  it.each([
    ['2027-01-19', 'heute'],
    ['2027-01-18', 'gestern'],
    ['2027-01-16', 'Sa'],
    ['2027-01-13', 'Mi'],
    ['2027-01-12', '12.1.'],
    ['2026-12-31', '31.12.'],
  ])('names %s relative to Tuesday 19.1.2027 as %s', (isoDay, expected) => {
    expect(formatPastDay(isoDay, '2027-01-19')).toBe(expected);
  });
});

describe('isElevenFold', () => {
  it.each([
    [11, true],
    [33, true],
    [25, false],
    [0, false],
  ])('treats %i as eleven-fold: %s', (value, expected) => {
    expect(isElevenFold(value)).toBe(expected);
  });
});

describe('toMineLine', () => {
  it.each<{ label: string; item: StartMine; context: MineLineContext; target: object }>([
    {
      label: 'a new role opens its sheet',
      item: mine({ kind: 'newRole', subjectId: 7 }),
      context: MEMBER,
      target: { kind: 'sheet', sheetId: 'role-7' },
    },
    {
      label: 'a new board seat opens the office sheet',
      item: mine({ kind: 'newBoardSeat', subjectId: 3 }),
      context: MEMBER,
      target: { kind: 'sheet', sheetId: 'office-3' },
    },
    {
      label: 'a new group membership leads to the group',
      item: mine({ kind: 'newGroupMembership', subjectId: 4 }),
      context: MEMBER,
      target: { kind: 'route', to: '/groups/$groupId', params: { groupId: '4' } },
    },
    {
      label: 'a new key leads to its venue sheet on the club page',
      item: mine({ kind: 'newKey', subjectId: 2 }),
      context: MEMBER,
      target: { kind: 'route', to: '/club', search: { sheet: 'venue-2' } },
    },
    {
      label: 'a new key stays inert without club reading',
      item: mine({ kind: 'newKey', subjectId: 2 }),
      context: { ...MEMBER, canReadClub: false },
      target: { kind: 'none' },
    },
    {
      label: 'a contact change leads to her profile',
      item: mine({ kind: 'contactChangedByOther', subjectId: null }),
      context: MEMBER,
      target: { kind: 'route', to: '/profile' },
    },
  ])('$label', ({ item, context, target }) => {
    expect(toMineLine(item, context).target).toMatchObject(target);
  });

  it.each<{ kind: StartMine['kind']; anchor: object }>([
    { kind: 'newRole', anchor: { kind: 'icon', name: 'role', tone: 'muted' } },
    { kind: 'newBoardSeat', anchor: { kind: 'icon', name: 'board', tone: 'muted' } },
    { kind: 'newGroupAdmin', anchor: { kind: 'icon', name: 'group', tone: 'muted' } },
    { kind: 'newKey', anchor: { kind: 'icon', name: 'key', tone: 'muted' } },
    { kind: 'membershipEnding', anchor: { kind: 'icon', name: 'info', tone: 'info' } },
    { kind: 'membershipPaused', anchor: { kind: 'icon', name: 'info', tone: 'info' } },
  ])('anchors a $kind line on its icon', ({ kind, anchor }) => {
    expect(toMineLine(mine({ kind }), MEMBER).anchor).toEqual(anchor);
  });

  it('anchors a milestone on its festive number and names the join day', () => {
    const line = toMineLine(
      mine({ kind: 'milestone', subjectId: null, on: '2027-03-01', years: 33 }),
      { ...MEMBER, memberSince: '1994-03-01' },
    );

    expect(line.anchor).toEqual({ kind: 'number', value: 33, festive: true });
    expect(line.meta.join(' ')).toContain('1.3.1994');
  });

  it('derives the join day from the anniversary when the membership start is unknown', () => {
    const line = toMineLine(
      mine({ kind: 'milestone', subjectId: null, on: '2027-03-01', years: 25 }),
      MEMBER,
    );

    expect(line.anchor).toEqual({ kind: 'number', value: 25, festive: false });
    expect(line.meta.join(' ')).toContain('1.3.2002');
  });

  it('ticks a group line with the group tone, falling back when it has none', () => {
    const toned = toMineLine(
      mine({ kind: 'newGroupAdmin', subjectId: 4, groupTone: 'rose' }),
      MEMBER,
    );
    const toneless = toMineLine(mine({ kind: 'newGroupAdmin', subjectId: 4 }), MEMBER);

    expect(toned.tick).toBe('rose');
    expect(toneless.tick).not.toBeNull();
  });

  it('puts the function before the since day of a new group admin', () => {
    const line = toMineLine(
      mine({ kind: 'newGroupAdmin', subjectId: 4, function: 'Trainerin', on: '2027-01-18' }),
      MEMBER,
    );

    expect(line.meta).toHaveLength(2);
    expect(line.meta[0]).toBe('Trainerin');
    expect(line.meta[1]).toContain('gestern');
  });

  it('names who changed her contact details and when', () => {
    const line = toMineLine(
      mine({
        kind: 'contactChangedByOther',
        subjectId: null,
        on: '2027-01-12',
        changedBy: { personId: 9, firstName: 'Frank', lastName: 'Weber' },
      }),
      MEMBER,
    );

    expect(line.meta).toHaveLength(2);
    expect(line.meta[0]).toContain('Frank Weber');
    expect(line.meta[1]).toBe('12.1.');
  });

  it('names the paused session', () => {
    const line = toMineLine(
      mine({ kind: 'membershipPaused', subjectId: null, sessionStartYear: 2027 }),
      MEMBER,
    );

    expect(line.meta.join(' ')).toContain('2027/28');
  });

  it('keys the line like the frozen visit and quiets it until its end', () => {
    const line = toMineLine(mine({ kind: 'newRole', subjectId: 7 }), MEMBER);

    expect(line.key).toBe('mine:newRole:7:2027-01-18');
    expect(line.until).toBe('2027-01-31');
  });

  it('speaks the number together with the title', () => {
    const line = toMineLine(
      mine({ kind: 'milestone', subjectId: null, on: '2027-03-01', years: 33 }),
      MEMBER,
    );

    expect(line.accessibleName.startsWith(`33 ${line.title}`)).toBe(true);
  });
});

describe('toGroupMomentLine', () => {
  it('anchors a jubilee on its years, ticks the group and leads to it', () => {
    const line = toGroupMomentLine({
      kind: 'jubilee',
      groupId: 6,
      name: 'Kindergarde',
      tone: 'teal',
      years: 25,
      foundedYear: 2001,
      until: '2026-11-24',
    });

    expect(line.anchor).toEqual({ kind: 'number', value: 25, festive: false });
    expect(line.tick).toBe('teal');
    expect(line.target).toMatchObject({ kind: 'route', params: { groupId: '6' } });
    expect(line.meta.join(' ')).toContain('2001');
    expect(line.key).toBe('groups:jubilee:6');
  });
});

describe('toAnnouncementLine', () => {
  const announcement = (officeName: string | null): StartAnnouncement => ({
    announcementId: 12,
    title: 'Busfahrt zum Rosenmontagsumzug',
    body: 'Abfahrt am Rathaus.',
    publishedAt: '2027-01-18T09:00:00Z',
    validUntil: null,
    author: {
      personId: 1,
      firstName: 'Karin',
      lastName: 'Albrecht',
      portraitUrl: null,
      officeName,
    },
  });
  const now = new Date(2027, 0, 19, 19, 50);

  it('names the day and the office of the author', () => {
    const line = toAnnouncementLine(announcement('Schriftführerin'), now);

    expect(line.meta).toEqual(['gestern', 'Schriftführerin']);
  });

  it('names only the day when the author holds no office', () => {
    expect(toAnnouncementLine(announcement(null), now).meta).toEqual(['gestern']);
  });

  it('falls back to initials and opens the sheet at this announcement', () => {
    const line = toAnnouncementLine(announcement(null), now);

    expect(line.initials).toBe('KA');
    expect(line.portrait).toBeUndefined();
    expect(line.sheetId).toBe('start-announcements-12');
  });
});

describe('toToDoLabel', () => {
  it.each<{ toDo: StartToDo; form: 'one' | 'other' }>([
    { toDo: { kind: 'reminderDue', count: 1 }, form: 'one' },
    { toDo: { kind: 'reminderDue', count: 12 }, form: 'other' },
    { toDo: { kind: 'birthDateUnknown', count: 2 }, form: 'other' },
    { toDo: { kind: 'clubRecordGap', count: 1 }, form: 'one' },
  ])('uses the $form form for $toDo.count $toDo.kind', ({ toDo, form }) => {
    expect(toToDoLabel(toDo)).toBe(TO_DO_LABELS[toDo.kind][form]);
  });
});

describe('toEntryMeta', () => {
  const venue = {
    venueId: 3,
    name: 'Sporthalle Am Ring',
    street: null,
    zip: null,
    city: null,
    hint: null,
  };

  it('marks the venue with the key when she holds one', () => {
    const [facet] = toEntryMeta(entry({ venue, viewerHoldsVenueKey: true }));

    expect(facet).toEqual({ text: 'Sporthalle Am Ring', icon: 'key' });
  });

  it('shows the bare venue without a key', () => {
    const [facet] = toEntryMeta(entry({ venue }));

    expect(facet).toEqual({ text: 'Sporthalle Am Ring' });
  });
});

describe('toCalendarTick', () => {
  const owner = { groupId: 4, name: 'Tanzgarde', tone: null };

  it('ticks a toneless owner group of hers with its fallback tone', () => {
    expect(toCalendarTick(entry({ ownerGroup: owner, viewerGroupIds: [4] }))).not.toBeNull();
  });

  it('leaves a club-owned entry without a tick', () => {
    expect(toCalendarTick(entry({ viewerGroupIds: [4] }))).toBeNull();
  });

  it('leaves out the tick when the title names the group', () => {
    expect(
      toCalendarTick(
        entry({ title: 'Tanzgarde Training', ownerGroup: owner, viewerGroupIds: [4] }),
      ),
    ).toBeNull();
  });
});

describe('toEntryTrailing', () => {
  it.each<{ label: string; attendance: StartEntry['attendance']; expected: object }>([
    { label: 'the entry asks nothing', attendance: null, expected: { kind: 'none' } },
    {
      label: 'her answer is owed',
      attendance: { viewerAnswer: null, isOwed: true },
      expected: { kind: 'ring' },
    },
    {
      label: 'she may answer but owes nothing',
      attendance: { viewerAnswer: null, isOwed: false },
      expected: { kind: 'none' },
    },
    {
      label: 'she answered maybe',
      attendance: { viewerAnswer: 'maybe', isOwed: false },
      expected: { kind: 'mark', answer: 'maybe' },
    },
  ])('shows $expected.kind when $label', ({ attendance, expected }) => {
    expect(toEntryTrailing(attendance)).toEqual(expected);
  });
});

describe('toEntryLineState', () => {
  it.each([
    { running: true, dimmed: true, expected: 'dimmed' },
    { running: true, dimmed: false, expected: 'live' },
    { running: false, dimmed: false, expected: 'plain' },
  ])('is $expected when running $running and dimmed $dimmed', ({ running, dimmed, expected }) => {
    expect(toEntryLineState(running, dimmed)).toBe(expected);
  });
});

describe('toValidUntilLine', () => {
  it.each([
    [null, null],
    ['2027-02-09', 'Gültig bis 9.2.2027'],
  ])('formats %s', (validUntil, expected) => {
    expect(toValidUntilLine(validUntil)).toBe(expected);
  });
});
