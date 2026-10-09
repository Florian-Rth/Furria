import { describe, expect, it } from 'vitest';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import type { PersonMeta, ViewerStanding } from './group-hub-labels';
import {
  personMetaOf,
  toAdminChainRows,
  toEndQuickChoices,
  toGroupInfoFormValues,
  toGroupInfoPayload,
  toHubOrigin,
  toJoinQuickChoices,
  toMembershipChainRows,
  toSearchTerm,
  toTakenTones,
  viewerStandingOf,
} from './group-hub-labels';
import type { HubPerson } from './hub-people';
import type { GroupHub } from './schemas';

const hubMember = (overrides: Partial<GroupDetailMember>): GroupDetailMember => ({
  groupMembershipId: 7,
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
  portrait: null,
  joinedOn: '2017-09-01',
  leftOn: null,
  since: '2017-09-01',
  isAffiliated: true,
  ...overrides,
});

const hubAdmin = (overrides: Partial<GroupDetailAdmin>): GroupDetailAdmin => ({
  groupAdminId: 4,
  personId: 9,
  firstName: 'Anna',
  lastName: 'Kaiser',
  portrait: null,
  function: null,
  sinceOn: '2019-01-01',
  untilOn: null,
  since: '2019-01-01',
  isAffiliated: true,
  ...overrides,
});

const groupHub = (overrides: Partial<GroupHub>): GroupHub => ({
  groupId: 3,
  picture: null,
  pictureEditing: null,
  name: 'Tanzgarde',
  description: 'Die Garde tanzt seit 1971.',
  isRecruiting: false,
  groupKindId: null,
  groupKindName: null,
  foundedYear: null,
  tone: null,
  trainingSlots: [],
  admins: [],
  members: [],
  viewerIsMember: false,
  viewerIsAdmin: false,
  viewerMayManage: false,
  viewerSince: null,
  pastMembers: [],
  pastAdmins: [],
  ...overrides,
});

const groupPerson = (overrides: Partial<HubPerson>): HubPerson => ({
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
  portrait: undefined,
  isAffiliated: true,
  groupMembershipId: 7,
  memberSince: '2017-09-01',
  groupAdminId: null,
  adminSince: null,
  adminFunction: null,
  ...overrides,
});

describe('toMembershipChainRows', () => {
  it('lists the running period ahead of every past one', () => {
    const hub = groupHub({
      members: [hubMember({ groupMembershipId: 7, personId: 12 })],
      pastMembers: [
        hubMember({
          groupMembershipId: 5,
          personId: 12,
          joinedOn: '2015-09-01',
          leftOn: '2016-09-01',
        }),
      ],
    });

    expect(toMembershipChainRows(hub, 12, null).map((row) => row.key)).toEqual(['7', '5']);
  });

  it('marks the edited entry and leaves every other person out', () => {
    const hub = groupHub({
      members: [hubMember({ groupMembershipId: 7, personId: 12 })],
      pastMembers: [hubMember({ groupMembershipId: 5, personId: 99 })],
    });

    expect(
      toMembershipChainRows(hub, 12, 7).map(({ key, isEdited }) => ({ key, isEdited })),
    ).toEqual([{ key: '7', isEdited: true }]);
  });
});

describe('toAdminChainRows', () => {
  it('lists the running appointment ahead of every past one of that person', () => {
    const hub = groupHub({
      admins: [
        hubAdmin({ groupAdminId: 4, personId: 9 }),
        hubAdmin({ groupAdminId: 6, personId: 1 }),
      ],
      pastAdmins: [
        hubAdmin({ groupAdminId: 2, personId: 9, sinceOn: '2018-01-01', untilOn: '2018-12-31' }),
      ],
    });

    expect(toAdminChainRows(hub, 9, 2).map(({ key, isEdited }) => ({ key, isEdited }))).toEqual([
      { key: '4', isEdited: false },
      { key: '2', isEdited: true },
    ]);
  });
});

describe('viewerStandingOf', () => {
  it.each<[string, Partial<GroupHub>, ViewerStanding | null]>([
    [
      'a member',
      { viewerIsMember: true, viewerSince: '2016-11-11' },
      { kind: 'member', since: '2016-11-11' },
    ],
    [
      'an admin who dances in the group herself',
      { viewerIsMember: true, viewerIsAdmin: true, viewerSince: '2020-11-11' },
      { kind: 'member', since: '2020-11-11' },
    ],
    ['an admin who dances in no row of the group', { viewerIsAdmin: true }, { kind: 'leading' }],
    ['a manager who is not in the group', { viewerMayManage: true }, null],
  ])('reads %s', (_case, hub, expected) => {
    expect(viewerStandingOf(groupHub(hub))).toEqual(expected);
  });
});

describe('personMetaOf', () => {
  it.each<[string, Partial<HubPerson>, boolean, PersonMeta | null]>([
    ['anyone for a viewer who does not manage', {}, false, null],
    ['a member', {}, true, { kind: 'member', since: '2017-09-01' }],
    [
      'an admin who is no member',
      { groupMembershipId: null, memberSince: null, groupAdminId: 4, adminSince: '2019-01-01' },
      true,
      { kind: 'leading', since: '2019-01-01' },
    ],
  ])('dates %s', (_case, person, canManage, expected) => {
    expect(personMetaOf(groupPerson(person), canManage)).toEqual(expected);
  });
});

describe('toGroupInfoPayload', () => {
  it('turns the empty choices into nulls and the year into a number', () => {
    expect(
      toGroupInfoPayload({
        description: 'Die Garde tanzt.',
        isRecruiting: true,
        groupKindId: '',
        foundedYear: '',
        tone: '',
      }),
    ).toEqual({
      description: 'Die Garde tanzt.',
      isRecruiting: true,
      groupKindId: null,
      foundedYear: null,
      tone: null,
    });
  });

  it('carries every filled choice through', () => {
    expect(
      toGroupInfoPayload({
        description: '',
        isRecruiting: false,
        groupKindId: '7',
        foundedYear: '1974',
        tone: 'teal',
      }),
    ).toEqual({
      description: '',
      isRecruiting: false,
      groupKindId: 7,
      foundedYear: 1974,
      tone: 'teal',
    });
  });
});

describe('toGroupInfoFormValues', () => {
  it('reads every field off the loaded hub', () => {
    expect(
      toGroupInfoFormValues(
        groupHub({
          description: 'Die Garde tanzt.',
          isRecruiting: true,
          groupKindId: 7,
          foundedYear: 1974,
          tone: 'teal',
        }),
      ),
    ).toEqual({
      description: 'Die Garde tanzt.',
      isRecruiting: true,
      groupKindId: '7',
      foundedYear: '1974',
      tone: 'teal',
    });
  });

  it('turns an unset group kind, founded year and group tone into empty choices', () => {
    expect(
      toGroupInfoFormValues(groupHub({ groupKindId: null, foundedYear: null, tone: null })),
    ).toEqual(expect.objectContaining({ groupKindId: '', foundedYear: '', tone: '' }));
  });

  it('overrides isRecruiting', () => {
    expect(
      toGroupInfoFormValues(groupHub({ isRecruiting: false }), { isRecruiting: true }),
    ).toEqual(expect.objectContaining({ isRecruiting: true }));
  });
});

describe('toHubOrigin', () => {
  it.each<[string, boolean | null, boolean, string]>([
    ['an affiliated viewer', true, false, '/groups'],
    ['the managing login', false, true, '/manage'],
    ['an unaffiliated viewer', false, false, '/profile'],
    ['a viewer whose affiliation is still undecided', null, false, '/groups'],
  ])('sends %s back to %s', (_case, isAffiliated, isManagingLogin, expected) => {
    expect(toHubOrigin(isAffiliated, isManagingLogin).to).toBe(expected);
  });
});

describe('toTakenTones', () => {
  it('collects every other group tone and skips the one being edited', () => {
    const taken = toTakenTones(
      [
        { groupId: 3, tone: 'rose' },
        { groupId: 4, tone: 'teal' },
        { groupId: 5, tone: null },
        { groupId: 6, tone: 'teal' },
      ],
      3,
    );

    expect([...taken]).toEqual(['teal']);
  });
});

describe('toSearchTerm', () => {
  it.each([
    { raw: ' b ', expected: null },
    { raw: 'br', expected: 'br' },
    { raw: '  Brendel  ', expected: 'Brendel' },
    { raw: 'x'.repeat(200), expected: 'x'.repeat(64) },
  ])('turns $raw into the term the server accepts', ({ raw, expected }) => {
    expect(toSearchTerm(raw)).toBe(expected);
  });
});

describe('toJoinQuickChoices', () => {
  it.each([
    ['a day inside the running Session', new Date(2026, 1, 20), ['2026-02-20', '2025-11-11']],
    ['a day after the 11.11.', new Date(2026, 10, 12), ['2026-11-12', '2026-11-11']],
    ['the Sessionbeginn itself', new Date(2025, 10, 11), ['2025-11-11']],
  ])('offers today and the Session start for %s', (_case, today, expected) => {
    expect(toJoinQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});

describe('toEndQuickChoices', () => {
  it.each([
    ['a day inside the running Session', new Date(2026, 1, 20), ['2026-02-20', '2026-11-10']],
    ['the last day of the Session', new Date(2026, 10, 10), ['2026-11-10']],
  ])('offers today and the Session end for %s', (_case, today, expected) => {
    expect(toEndQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});
