import { describe, expect, it } from 'vitest';
import {
  toAdminCountLabel,
  toEndConsequence,
  toEndFacts,
  toEndQuickChoices,
  toHistoryEntries,
  toHubHeadline,
  toHubId,
  toJoinConsequence,
  toJoinQuickChoices,
  toMemberAddedMessage,
  toMembershipEndedMessage,
  toPeopleCountLabel,
  toSearchCapLine,
  toSearchTerm,
} from './group-hub-labels';
import type { HubAdmin, HubDetails, HubMember } from './schemas';

const hubMember = (overrides: Partial<HubMember>): HubMember => ({
  groupMembershipId: 7,
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
  joinedOn: '2017-09-01',
  leftOn: null,
  since: '2017-09-01',
  ...overrides,
});

const hubAdmin = (overrides: Partial<HubAdmin>): HubAdmin => ({
  groupAdminId: 4,
  personId: 9,
  firstName: 'Anna',
  lastName: 'Kaiser',
  function: null,
  sinceOn: '2019-01-01',
  untilOn: null,
  since: '2019-01-01',
  ...overrides,
});

const hubDetails = (overrides: Partial<HubDetails>): HubDetails => ({
  groupId: 3,
  name: 'Tanzgarde',
  description: 'Die Garde tanzt seit 1971.',
  isRecruiting: false,
  viewerIsAdmin: false,
  members: [],
  admins: [],
  pastMembers: [],
  pastAdmins: [],
  ...overrides,
});

describe('toHubId', () => {
  it.each([
    { case: 'a positive id', raw: '3', expected: 3 },
    { case: 'a long id', raw: '1204', expected: 1204 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a negative id', raw: '-3', expected: null },
    { case: 'a word', raw: 'tanzgarde', expected: null },
    { case: 'a decimal', raw: '3.5', expected: null },
    { case: 'nothing', raw: '', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toHubId(raw)).toBe(expected);
  });
});

describe('toPeopleCountLabel', () => {
  it.each([
    { count: 0, expected: 'niemand dabei' },
    { count: 1, expected: '1 Person dabei' },
    { count: 2, expected: '2 Personen dabei' },
    { count: 18, expected: '18 Personen dabei' },
  ])('counts $count as $expected', ({ count, expected }) => {
    expect(toPeopleCountLabel(count)).toBe(expected);
  });
});

describe('toAdminCountLabel', () => {
  it.each([
    { count: 0, expected: 'kein Gruppen-Admin' },
    { count: 1, expected: '1 Gruppen-Admin' },
    { count: 3, expected: '3 Gruppen-Admins' },
  ])('counts $count as $expected', ({ count, expected }) => {
    expect(toAdminCountLabel(count)).toBe(expected);
  });
});

describe('toHubHeadline', () => {
  it('falls back to the section title while the hub is still loading', () => {
    expect(toHubHeadline(undefined)).toEqual({
      title: 'Meine Gruppe',
      eyebrow: null,
      countLine: null,
    });
  });

  it('tells a plain member that she is one of the people here', () => {
    const headline = toHubHeadline(
      hubDetails({ members: [hubMember({}), hubMember({ groupMembershipId: 8 })] }),
    );

    expect(headline).toEqual({
      title: 'Tanzgarde',
      eyebrow: 'du bist hier dabei',
      countLine: '2 Personen dabei · kein Gruppen-Admin',
    });
  });

  it('tells a Gruppen-Admin that she runs this Gruppe', () => {
    const headline = toHubHeadline(
      hubDetails({ viewerIsAdmin: true, members: [hubMember({})], admins: [hubAdmin({})] }),
    );

    expect(headline).toEqual({
      title: 'Tanzgarde',
      eyebrow: 'du bist Gruppen-Admin',
      countLine: '1 Person dabei · 1 Gruppen-Admin',
    });
  });
});

describe('toHistoryEntries', () => {
  it('merges both kinds of closed row into one chronology, newest start first', () => {
    const entries = toHistoryEntries(
      [
        hubMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' }),
        hubMember({ groupMembershipId: 12, joinedOn: '2014-09-01', leftOn: '2016-03-01' }),
      ],
      [hubAdmin({ groupAdminId: 21, sinceOn: '2016-09-01', untilOn: '2018-06-30' })],
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      'membership-11',
      'admin-21',
      'membership-12',
    ]);
  });

  it('renders a closed Zugehörigkeit as its span, never as a seit', () => {
    const [entry] = toHistoryEntries(
      [hubMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' })],
      [],
    );

    expect(entry).toEqual({
      key: 'membership-11',
      title: 'Mara Lenz',
      span: '01.09.2019 – 28.02.2022',
      kind: 'membership',
      meta: undefined,
    });
  });

  it.each([
    { case: 'no Funktion', adminFunction: null, expected: undefined },
    { case: 'a Funktion', adminFunction: 'Trainerin', expected: 'Trainerin' },
  ])('carries $case on a closed admin row', ({ adminFunction, expected }) => {
    const [entry] = toHistoryEntries(
      [],
      [
        hubAdmin({
          groupAdminId: 21,
          function: adminFunction,
          sinceOn: '2016-09-01',
          untilOn: '2018-06-30',
        }),
      ],
    );

    expect(entry?.kind).toBe('admin');
    expect(entry?.meta).toBe(expected);
    expect(entry?.span).toBe('01.09.2016 – 30.06.2018');
  });

  it('orders two rows that started on the same day by their own identity', () => {
    const entries = toHistoryEntries(
      [hubMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' })],
      [hubAdmin({ groupAdminId: 21, sinceOn: '2019-09-01', untilOn: '2021-06-30' })],
    );

    expect(entries.map((entry) => entry.key)).toEqual(['admin-21', 'membership-11']);
  });

  it('has nothing to show when no row has ended', () => {
    expect(toHistoryEntries([], [])).toEqual([]);
  });
});

describe('toSearchTerm', () => {
  it.each([
    { raw: '', expected: null },
    { raw: ' b ', expected: null },
    { raw: 'br', expected: 'br' },
    { raw: '  Brendel  ', expected: 'Brendel' },
    { raw: 'müller', expected: 'müller' },
  ])('turns $raw into the term the server accepts', ({ raw, expected }) => {
    expect(toSearchTerm(raw)).toBe(expected);
  });

  it('never sends more than the 64 characters the endpoint takes', () => {
    expect(toSearchTerm('x'.repeat(200))).toBe('x'.repeat(64));
  });
});

describe('toSearchCapLine', () => {
  it.each([
    { count: 0, capped: false },
    { count: 24, capped: false },
    { count: 25, capped: true },
  ])('says the result may be cut at $count rows: $capped', ({ count, capped }) => {
    expect(toSearchCapLine(count) !== null).toBe(capped);
  });
});

describe('toJoinQuickChoices', () => {
  it('offers today and the start of the running Session', () => {
    expect(toJoinQuickChoices(new Date(2026, 1, 20))).toEqual([
      { label: 'Heute', value: '2026-02-20' },
      { label: 'Sessionbeginn', value: '2025-11-11' },
    ]);
  });

  it('reads the Session that opened this year once the 11.11. has passed', () => {
    expect(toJoinQuickChoices(new Date(2026, 10, 12))[1]).toEqual({
      label: 'Sessionbeginn',
      value: '2026-11-11',
    });
  });

  it('offers one choice when today is the Sessionbeginn', () => {
    expect(toJoinQuickChoices(new Date(2025, 10, 11))).toEqual([
      { label: 'Heute', value: '2025-11-11' },
    ]);
  });
});

describe('toEndQuickChoices', () => {
  it('offers today and the last day of the running Session', () => {
    expect(toEndQuickChoices(new Date(2026, 1, 20))).toEqual([
      { label: 'Heute', value: '2026-02-20' },
      { label: 'Sessionende', value: '2026-11-10' },
    ]);
  });

  it('offers one choice when today is the last day of the Session', () => {
    expect(toEndQuickChoices(new Date(2026, 10, 10))).toEqual([
      { label: 'Heute', value: '2026-11-10' },
    ]);
  });
});

describe('toMemberAddedMessage', () => {
  it('announces a future start with its date', () => {
    expect(toMemberAddedMessage('Paula Brendel', '2026-09-01', '2026-03-01')).toBe(
      'Paula Brendel ist ab dem 01.09.2026 dabei.',
    );
  });

  it.each(['2026-03-01', '2017-09-01'])('reports a start on %s as done', (joinedOn) => {
    expect(toMemberAddedMessage('Paula Brendel', joinedOn, '2026-03-01')).toBe(
      'Paula Brendel ist aufgenommen.',
    );
  });
});

describe('toMembershipEndedMessage', () => {
  it('announces a future end with its date', () => {
    expect(toMembershipEndedMessage('Paula Brendel', '2026-09-01', '2026-03-01')).toBe(
      'Die Zugehörigkeit von Paula Brendel endet am 01.09.2026.',
    );
  });

  it('reports an end today as done', () => {
    expect(toMembershipEndedMessage('Paula Brendel', '2026-03-01', '2026-03-01')).toBe(
      'Die Zugehörigkeit von Paula Brendel ist beendet.',
    );
  });
});

describe('toJoinConsequence', () => {
  it('warns that a future row stays out of the list until its day', () => {
    expect(toJoinConsequence('Paula Brendel', '2026-09-01', '2026-03-01')).toContain(
      'vorher nicht in der Liste',
    );
  });

  it('states the day a running row begins', () => {
    expect(toJoinConsequence('Paula Brendel', '2026-03-01', '2026-03-01')).toBe(
      'Paula Brendel gehört ab dem 01.03.2026 zur Gruppe.',
    );
  });
});

describe('toEndConsequence', () => {
  it('speaks of a future last day in the future tense', () => {
    expect(toEndConsequence('Paula Brendel', '2026-09-01', '2026-03-01')).toBe(
      'Der 01.09.2026 wird der letzte Tag von Paula Brendel in der Gruppe. Die Zugehörigkeit bleibt in der Geschichte stehen.',
    );
  });

  it('speaks of today as the last day in the present tense', () => {
    expect(toEndConsequence('Paula Brendel', '2026-03-01', '2026-03-01')).toBe(
      'Der 01.03.2026 ist der letzte Tag von Paula Brendel in der Gruppe. Die Zugehörigkeit bleibt in der Geschichte stehen.',
    );
  });
});

describe('toEndFacts', () => {
  it('answers who, in which Gruppe, since when and until when', () => {
    const facts = toEndFacts(
      hubMember({ firstName: 'Paula', lastName: 'Brendel', joinedOn: '2019-09-01' }),
      'Tanzgarde',
      '2026-02-28',
    );

    expect(facts).toEqual([
      { label: 'Person', value: 'Paula Brendel' },
      { label: 'Gruppe', value: 'Tanzgarde' },
      { label: 'Dabei seit', value: '01.09.2019' },
      { label: 'Letzter Tag', value: '28.02.2026' },
    ]);
  });

  it('says the last day is still open while none is chosen', () => {
    expect(toEndFacts(hubMember({}), 'Tanzgarde', null)[3]).toEqual({
      label: 'Letzter Tag',
      value: 'noch offen',
    });
  });
});
