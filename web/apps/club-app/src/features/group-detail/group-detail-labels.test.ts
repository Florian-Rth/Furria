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

  it('orders two rows that started on the same day by their own identity', () => {
    const entries = toGroupHistoryEntries(
      [pastMember({ groupMembershipId: 11, joinedOn: '2019-09-01', leftOn: '2022-02-28' })],
      [pastAdmin({ groupAdminId: 21, sinceOn: '2019-09-01', untilOn: '2021-06-30' })],
    );

    expect(entries.map((entry) => entry.key)).toEqual(['admin-21', 'membership-11']);
  });
});
