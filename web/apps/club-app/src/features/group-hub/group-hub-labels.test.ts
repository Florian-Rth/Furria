import { describe, expect, it } from 'vitest';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import {
  toAdminAppointedMessage,
  toAdminChainRows,
  toAdminEndConsequence,
  toAdminEndedMessage,
  toAdminEndParagraph,
  toAdminFunction,
  toAnniversarySeal,
  toAppointConsequence,
  toArchiveGroupConsequence,
  toArchiveGroupFacts,
  toEndConsequence,
  toEndQuickChoices,
  toGroupArchivedFromHubMessage,
  toGroupInfoFormValues,
  toGroupInfoPayload,
  toHubId,
  toHubMetaFacts,
  toHubOrigin,
  toJoinAsAdminConsequence,
  toJoinConsequence,
  toJoinQuickChoices,
  toLastAdminWarning,
  toMemberAddedAsAdminMessage,
  toMemberAddedMessage,
  toMembershipChainRows,
  toMembershipEndedMessage,
  toPersonAccent,
  toPersonIdParam,
  toPersonMetaLine,
  toPersonStandingLines,
  toSearchCapLine,
  toSearchTerm,
  toSelfAdminEndedMessage,
  toStandingLine,
  toTakenTones,
  toToneWarning,
} from './group-hub-labels';
import type { HubPerson } from './hub-people';
import type { GroupHub } from './schemas';

const hubMember = (overrides: Partial<GroupDetailMember>): GroupDetailMember => ({
  groupMembershipId: 7,
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
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
  function: null,
  sinceOn: '2019-01-01',
  untilOn: null,
  since: '2019-01-01',
  isAffiliated: true,
  ...overrides,
});

const groupHub = (overrides: Partial<GroupHub>): GroupHub => ({
  groupId: 3,
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

describe('toPersonIdParam', () => {
  it.each([
    { case: 'undefined', raw: undefined, expected: null },
    { case: 'a positive id', raw: '9', expected: 9 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a word', raw: 'anna', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toPersonIdParam(raw)).toBe(expected);
  });
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

    expect(toMembershipChainRows(hub, 12, null)).toEqual([
      { key: '7', span: '01.09.2017 – offen', isEdited: false },
      { key: '5', span: '01.09.2015 – 01.09.2016', isEdited: false },
    ]);
  });

  it('marks the edited entry and leaves every other person out', () => {
    const hub = groupHub({
      members: [hubMember({ groupMembershipId: 7, personId: 12 })],
      pastMembers: [hubMember({ groupMembershipId: 5, personId: 99 })],
    });

    expect(toMembershipChainRows(hub, 12, 7)).toEqual([
      { key: '7', span: '01.09.2017 – offen', isEdited: true },
    ]);
  });
});

describe('toAdminChainRows', () => {
  it('lists a group admin history with her function folded into the span', () => {
    const hub = groupHub({
      admins: [hubAdmin({ groupAdminId: 4, personId: 9 })],
      pastAdmins: [
        hubAdmin({ groupAdminId: 2, personId: 9, sinceOn: '2018-01-01', untilOn: '2018-12-31' }),
      ],
    });

    expect(toAdminChainRows(hub, 9, null)).toEqual([
      { key: '4', span: '01.01.2019 – offen', isEdited: false },
      { key: '2', span: '01.01.2018 – 31.12.2018', isEdited: false },
    ]);
  });
});

describe('toStandingLine', () => {
  it('dates the viewer own group membership from the session she joined in', () => {
    expect(toStandingLine(groupHub({ viewerIsMember: true, viewerSince: '2016-11-11' }))).toBe(
      'Du bist Mitglied seit 2016/17',
    );
  });

  it('lets the group membership speak for an admin who dances in the group herself', () => {
    expect(
      toStandingLine(
        groupHub({ viewerIsMember: true, viewerIsAdmin: true, viewerSince: '2020-11-11' }),
      ),
    ).toBe('Du bist Mitglied seit 2020/21');
  });

  it('names the responsibility of an admin who dances in no row of the group', () => {
    expect(toStandingLine(groupHub({ viewerIsAdmin: true }))).toBe('Du leitest diese Gruppe');
  });

  it('stays silent for a mere group admin who is not in the group', () => {
    expect(toStandingLine(groupHub({ viewerMayManage: true }))).toBeNull();
  });

  it('stays silent for a stranger', () => {
    expect(toStandingLine(groupHub({}))).toBeNull();
  });
});

describe('toHubMetaFacts', () => {
  it('leaves the founding year out while nobody has entered one', () => {
    expect(toHubMetaFacts(groupHub({ members: [hubMember({})] }))).toEqual([
      '1 Person',
      'kein Gruppen-Admin',
    ]);
  });

  it('leads with the founding year once it is known', () => {
    const facts = toHubMetaFacts(
      groupHub({ foundedYear: 2009, members: [hubMember({})], admins: [hubAdmin({})] }),
    );

    expect(facts).toEqual(['seit 2009', '1 Person', '1 Gruppen-Admin']);
  });
});

describe('toAnniversarySeal', () => {
  it('splits a fifth year into the seal label and its caption', () => {
    expect(toAnniversarySeal(2011, 2026)).toEqual({ yearsLabel: '15', caption: 'JAHRE' });
  });

  it.each([
    { case: 'an ordinary year', foundedYear: 2012, sessionYear: 2026 },
    { case: 'an unknown founding', foundedYear: null, sessionYear: 2026 },
    { case: 'the founding session itself', foundedYear: 2026, sessionYear: 2026 },
  ])('seals nothing for $case', ({ foundedYear, sessionYear }) => {
    expect(toAnniversarySeal(foundedYear, sessionYear)).toBeNull();
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

  it('overrides isRecruiting without touching any other field', () => {
    expect(
      toGroupInfoFormValues(groupHub({ isRecruiting: false }), { isRecruiting: true }),
    ).toEqual(expect.objectContaining({ isRecruiting: true }));
  });
});

describe('toHubOrigin', () => {
  it('sends an affiliated viewer back to the group directory', () => {
    expect(toHubOrigin(true).to).toBe('/groups');
  });

  it('sends an unaffiliated viewer somewhere she may go', () => {
    expect(toHubOrigin(false).to).toBe('/profile');
  });

  it('keeps the group directory while affiliation is still undecided', () => {
    expect(toHubOrigin(null).to).toBe('/groups');
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

describe('toToneWarning', () => {
  it('warns when another group already wears the tone', () => {
    expect(toToneWarning('teal', new Set(['teal']))).not.toBeNull();
  });

  it.each([
    { case: 'a free tone', tone: 'rose' as const },
    { case: 'no choice at all', tone: '' as const },
  ])('stays quiet for $case', ({ tone }) => {
    expect(toToneWarning(tone, new Set(['teal']))).toBeNull();
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
  it('dates a future row from its first day', () => {
    expect(toJoinConsequence('Paula Brendel', '2026-09-01', '2026-03-01')).toBe(
      'Paula Brendel gehört ab dem 01.09.2026 zur Gruppe.',
    );
  });

  it('dates a running row since its first day', () => {
    expect(toJoinConsequence('Paula Brendel', '2026-03-01', '2026-03-01')).toBe(
      'Paula Brendel gehört seit dem 01.03.2026 zur Gruppe.',
    );
  });
});

describe('toEndConsequence', () => {
  it('speaks of a future last day in the future tense', () => {
    expect(toEndConsequence('Paula Brendel', '2026-09-01', '2026-03-01')).toBe(
      'Die Zugehörigkeit von Paula Brendel endet am 01.09.2026. Sie bleibt im Verlauf erhalten.',
    );
  });

  it('speaks of today as the last day in the present tense', () => {
    expect(toEndConsequence('Paula Brendel', '2026-03-01', '2026-03-01')).toBe(
      'Die Zugehörigkeit von Paula Brendel ist zum 01.03.2026 beendet. Sie bleibt im Verlauf erhalten.',
    );
  });
});

describe('toArchiveGroupConsequence', () => {
  it('says nobody is left when the group has no group membership', () => {
    expect(toArchiveGroupConsequence('Tanzgarde', 0, '22.09.2026')).toBe(
      'Ab dem 22.09.2026 ist Tanzgarde archiviert. Es ist niemand eingetragen.',
    );
  });

  it('keeps a single group membership in the singular', () => {
    expect(toArchiveGroupConsequence('Tanzgarde', 1, '22.09.2026')).toContain(
      '1 Zugehörigkeit bleibt bestehen.',
    );
  });

  it('counts several group memberships in the plural', () => {
    expect(toArchiveGroupConsequence('Tanzgarde', 4, '22.09.2026')).toContain(
      '4 Zugehörigkeiten bleiben bestehen.',
    );
  });
});

describe('toArchiveGroupFacts', () => {
  it('counts every running person and group admin', () => {
    expect(
      toArchiveGroupFacts(
        groupHub({ name: 'Tanzgarde', members: [hubMember({})], admins: [hubAdmin({})] }),
        '22.09.2026',
      ),
    ).toEqual([
      { label: 'Gruppe', value: 'Tanzgarde' },
      { label: 'Personen', value: '1' },
      { label: 'Gruppen-Admins', value: '1' },
      { label: 'Ab', value: '22.09.2026' },
    ]);
  });
});

describe('toGroupArchivedFromHubMessage', () => {
  it('names the group that left the directory', () => {
    expect(toGroupArchivedFromHubMessage('Tanzgarde')).toBe('Tanzgarde ist archiviert.');
  });
});

describe('toAdminFunction', () => {
  it.each([
    { case: 'nothing typed', raw: '', expected: null },
    { case: 'only spaces', raw: '   ', expected: null },
    { case: 'a padded label', raw: '  Trainerin  ', expected: 'Trainerin' },
    { case: 'a plain label', raw: 'Kommandantin', expected: 'Kommandantin' },
  ])('turns $case into what the endpoint takes', ({ raw, expected }) => {
    expect(toAdminFunction(raw)).toBe(expected);
  });
});

describe('toAdminAppointedMessage', () => {
  it('announces a future appointment with its date', () => {
    expect(toAdminAppointedMessage('Anna Kaiser', '2026-09-01', '2026-03-01')).toBe(
      'Anna Kaiser ist ab dem 01.09.2026 Gruppen-Admin.',
    );
  });

  it('reports an appointment that starts today as done', () => {
    expect(toAdminAppointedMessage('Anna Kaiser', '2026-03-01', '2026-03-01')).toBe(
      'Anna Kaiser ist jetzt Gruppen-Admin.',
    );
  });
});

describe('toAdminEndedMessage', () => {
  it('says a future end has not happened yet', () => {
    expect(toAdminEndedMessage('Anna Kaiser', '2026-09-01', '2026-03-01')).toBe(
      'Anna Kaiser ist noch bis zum 01.09.2026 Gruppen-Admin.',
    );
  });

  it('reports an end today as done', () => {
    expect(toAdminEndedMessage('Anna Kaiser', '2026-03-01', '2026-03-01')).toBe(
      'Anna Kaiser ist nicht mehr Gruppen-Admin.',
    );
  });
});

describe('toAppointConsequence', () => {
  it('dates a future appointment from its first day', () => {
    expect(toAppointConsequence('Anna Kaiser', '2026-09-01', '2026-03-01')).toContain(
      'ab dem 01.09.2026',
    );
  });

  it('dates a running appointment since its first day', () => {
    expect(toAppointConsequence('Anna Kaiser', '2026-03-01', '2026-03-01')).toContain(
      'seit dem 01.03.2026',
    );
  });
});

describe('toAdminEndConsequence', () => {
  it('dates a future end and keeps the group membership out of it', () => {
    const consequence = toAdminEndConsequence('Anna Kaiser', '2026-09-01', '2026-03-01');

    expect(consequence).toContain('ab dem 01.09.2026');
    expect(consequence).toContain('Zugehörigkeit zur Gruppe bleibt bestehen');
  });

  it('speaks of an end today in the present tense', () => {
    expect(toAdminEndConsequence('Anna Kaiser', '2026-03-01', '2026-03-01')).toContain('ab sofort');
  });
});

describe('toLastAdminWarning', () => {
  it.each([
    { case: 'the last running admin', runningAdmins: 1, warned: true },
    { case: 'a group already without one', runningAdmins: 0, warned: true },
    { case: 'one of several', runningAdmins: 2, warned: false },
  ])('warns about $case: $warned', ({ runningAdmins, warned }) => {
    expect(toLastAdminWarning(runningAdmins) !== null).toBe(warned);
  });
});

describe('toAdminEndParagraph', () => {
  it('says nothing when there is nothing to say', () => {
    expect(toAdminEndParagraph(null, false, 3)).toBeNull();
  });

  it('keeps the live consequence sentence on its own for someone else', () => {
    expect(toAdminEndParagraph('Anna kann ab sofort nicht mehr pflegen.', false, 3)).toBe(
      'Anna kann ab sofort nicht mehr pflegen.',
    );
  });

  it('warns the viewer first when the row she is ending is her own', () => {
    const paragraph = toAdminEndParagraph('Anna kann ab sofort nicht mehr pflegen.', true, 3);

    expect(paragraph).toBe(
      'Du beendest deine eigene Ernennung und kannst die Gruppe danach nicht mehr bearbeiten. Anna kann ab sofort nicht mehr pflegen.',
    );
  });

  it('keeps both warnings in one paragraph when she is also the last admin', () => {
    const paragraph = toAdminEndParagraph('Anna kann ab sofort nicht mehr pflegen.', true, 1);

    expect(paragraph).toContain('Du beendest deine eigene Ernennung');
    expect(paragraph).toContain('Anna kann ab sofort nicht mehr pflegen.');
    expect(paragraph).toContain('keinen Gruppen-Admin mehr');
  });
});

describe('toSelfAdminEndedMessage', () => {
  it('dates a removal that has not happened yet', () => {
    expect(toSelfAdminEndedMessage('Tanzgarde', '2026-09-01', '2026-03-01')).toBe(
      'Ab dem 01.09.2026 bist du nicht mehr Gruppen-Admin von Tanzgarde.',
    );
  });

  it('reports a removal that takes effect today in the present tense', () => {
    expect(toSelfAdminEndedMessage('Tanzgarde', '2026-03-01', '2026-03-01')).toBe(
      'Du bist nicht mehr Gruppen-Admin von Tanzgarde.',
    );
  });
});

const groupPerson = (overrides: Partial<HubPerson>): HubPerson => ({
  personId: 12,
  firstName: 'Mara',
  lastName: 'Lenz',
  isAffiliated: true,
  groupMembershipId: 7,
  memberSince: '2017-09-01',
  groupAdminId: null,
  adminSince: null,
  adminFunction: null,
  ...overrides,
});

describe('toPersonAccent', () => {
  it('leaves a plain member without a role label', () => {
    expect(toPersonAccent(groupPerson({}))).toBeUndefined();
  });

  it('wears the function of an admin who has one', () => {
    expect(toPersonAccent(groupPerson({ groupAdminId: 4, adminFunction: 'Trainerin' }))).toBe(
      'Trainerin',
    );
  });

  it('falls back to the bare office for an admin without a function', () => {
    expect(toPersonAccent(groupPerson({ groupAdminId: 4 }))).toBe('Gruppen-Admin');
  });
});

describe('toPersonMetaLine', () => {
  it('keeps the dates to management', () => {
    expect(toPersonMetaLine(groupPerson({}), false)).toBeUndefined();
  });

  it('dates a member from the session she joined in', () => {
    expect(toPersonMetaLine(groupPerson({}), true)).toBe('seit 2016/17');
  });

  it('dates an admin who is no member from her appointment', () => {
    expect(
      toPersonMetaLine(
        groupPerson({
          groupMembershipId: null,
          memberSince: null,
          groupAdminId: 4,
          adminSince: '2019-01-01',
        }),
        true,
      ),
    ).toBe('leitet seit 2018/19');
  });
});

describe('toPersonStandingLines', () => {
  it('names the group membership of a plain member', () => {
    expect(toPersonStandingLines(groupPerson({}))).toEqual(['Mitglied seit 2016/17']);
  });

  it('names both standings of an admin who dances along', () => {
    expect(
      toPersonStandingLines(groupPerson({ groupAdminId: 4, adminSince: '2019-01-01' })),
    ).toEqual(['Mitglied seit 2016/17', 'Gruppen-Admin seit 2018/19']);
  });

  it('names only the office of an admin who is no member', () => {
    expect(
      toPersonStandingLines(
        groupPerson({
          groupMembershipId: null,
          memberSince: null,
          groupAdminId: 4,
          adminSince: '2019-01-01',
        }),
      ),
    ).toEqual(['Gruppen-Admin seit 2018/19']);
  });
});

describe('toMemberAddedAsAdminMessage', () => {
  it('names both standings once the day has come', () => {
    expect(toMemberAddedAsAdminMessage('Mara Lenz', '2026-09-22', '2026-09-22')).toBe(
      'Mara Lenz ist aufgenommen und Gruppen-Admin.',
    );
  });

  it('dates both standings while the day is still ahead', () => {
    expect(toMemberAddedAsAdminMessage('Mara Lenz', '2026-10-01', '2026-09-22')).toBe(
      'Mara Lenz ist ab dem 01.10.2026 dabei und Gruppen-Admin.',
    );
  });
});

describe('toJoinAsAdminConsequence', () => {
  it('dates both standings since a day that has come', () => {
    expect(toJoinAsAdminConsequence('Mara', '2026-09-22', '2026-09-22')).toBe(
      'Mara gehört seit dem 22.09.2026 zur Gruppe und ist Gruppen-Admin.',
    );
  });

  it('dates both standings from a day still ahead', () => {
    expect(toJoinAsAdminConsequence('Mara', '2026-10-01', '2026-09-22')).toBe(
      'Mara gehört ab dem 01.10.2026 zur Gruppe und ist Gruppen-Admin.',
    );
  });
});
