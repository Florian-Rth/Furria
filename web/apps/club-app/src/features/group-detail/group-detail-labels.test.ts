import { describe, expect, it } from 'vitest';
import { toGroupHistoryEntries } from './group-detail-labels';
import type { GroupDetailAdmin, GroupDetailMember } from './schemas';

const pastMember = (overrides: Partial<GroupDetailMember>): GroupDetailMember => ({
  groupMembershipId: 7,
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
  joinedOn: '2017-09-01',
  leftOn: '2019-02-28',
  since: '2017-09-01',
  isAffiliated: true,
  ...overrides,
});

const pastAdmin = (overrides: Partial<GroupDetailAdmin>): GroupDetailAdmin => ({
  groupAdminId: 4,
  personId: 9,
  firstName: 'Anna',
  lastName: 'Kaiser',
  function: null,
  sinceOn: '2019-01-01',
  untilOn: '2021-02-28',
  since: '2019-01-01',
  isAffiliated: true,
  ...overrides,
});

describe('toGroupHistoryEntries', () => {
  it('merges both kinds of closed row into one chronology, newest start first', () => {
    const entries = toGroupHistoryEntries(
      [
        pastMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' }),
        pastMember({ groupMembershipId: 12, joinedOn: '2014-09-01', leftOn: '2016-03-01' }),
      ],
      [pastAdmin({ groupAdminId: 21, sinceOn: '2016-09-01', untilOn: '2018-06-30' })],
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      'membership-11',
      'admin-21',
      'membership-12',
    ]);
  });

  it('renders a closed Zugehörigkeit as its span, never as a seit', () => {
    const [entry] = toGroupHistoryEntries(
      [pastMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' })],
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
    const [entry] = toGroupHistoryEntries(
      [],
      [
        pastAdmin({
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
    const entries = toGroupHistoryEntries(
      [pastMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' })],
      [pastAdmin({ groupAdminId: 21, sinceOn: '2019-09-01', untilOn: '2021-06-30' })],
    );

    expect(entries.map((entry) => entry.key)).toEqual(['admin-21', 'membership-11']);
  });

  it('has nothing to show when no row has ended', () => {
    expect(toGroupHistoryEntries([], [])).toEqual([]);
  });
});
