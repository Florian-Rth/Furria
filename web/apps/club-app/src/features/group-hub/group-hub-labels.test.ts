import { describe, expect, it } from 'vitest';
import {
  toAdminCountLabel,
  toHistoryEntries,
  toHubHeadline,
  toHubId,
  toPeopleCountLabel,
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
