import { describe, expect, it } from 'vitest';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import {
  toAdminAppointedMessage,
  toAdminEndConsequence,
  toAdminEndedMessage,
  toAdminEndFacts,
  toAdminEndParagraph,
  toAdminFunction,
  toAppointConsequence,
  toEndConsequence,
  toEndFacts,
  toEndQuickChoices,
  toGroupInfoPayload,
  toHubId,
  toHubMetaFacts,
  toHubOrigin,
  toJoinAsAdminConsequence,
  toJoinConsequence,
  toJoinQuickChoices,
  toJubileeSeal,
  toLastAdminWarning,
  toMemberAddedAsAdminMessage,
  toMemberAddedMessage,
  toMembershipEndedMessage,
  toPeekAdminIntent,
  toPersonAccent,
  toPersonMetaLine,
  toPersonStandingLines,
  toPersonTap,
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

describe('toStandingLine', () => {
  it('dates the viewer own Zugehörigkeit from the session she joined in', () => {
    expect(toStandingLine(groupHub({ viewerIsMember: true, viewerSince: '2016-11-11' }))).toBe(
      'Du bist Mitglied seit 2016/17',
    );
  });

  it('lets the Zugehörigkeit speak for an admin who dances in the Gruppe herself', () => {
    expect(
      toStandingLine(
        groupHub({ viewerIsMember: true, viewerIsAdmin: true, viewerSince: '2020-11-11' }),
      ),
    ).toBe('Du bist Mitglied seit 2020/21');
  });

  it('names the responsibility of an admin who dances in no row of the Gruppe', () => {
    expect(toStandingLine(groupHub({ viewerIsAdmin: true }))).toBe('Du leitest diese Gruppe');
  });

  it('stays silent for a mere Gruppenverwalterin who is not in the Gruppe', () => {
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

describe('toJubileeSeal', () => {
  it('splits a fifth year into the seal label and its caption', () => {
    expect(toJubileeSeal(2011, 2026)).toEqual({ yearsLabel: '15', caption: 'JAHRE' });
  });

  it.each([
    { case: 'an ordinary year', foundedYear: 2012, sessionYear: 2026 },
    { case: 'an unknown founding', foundedYear: null, sessionYear: 2026 },
    { case: 'the founding session itself', foundedYear: 2026, sessionYear: 2026 },
  ])('seals nothing for $case', ({ foundedYear, sessionYear }) => {
    expect(toJubileeSeal(foundedYear, sessionYear)).toBeNull();
  });
});

describe('toPersonTap', () => {
  it.each([
    { case: 'an admin viewer', canManage: true, affiliated: true, row: true, expected: 'peek' },
    { case: 'a stranger row', canManage: false, affiliated: true, row: false, expected: 'peek' },
    {
      case: 'an unaffiliated viewer',
      canManage: false,
      affiliated: false,
      row: true,
      expected: 'peek',
    },
    {
      case: 'two affiliated parties',
      canManage: false,
      affiliated: true,
      row: true,
      expected: 'person',
    },
  ])('sends $case to the $expected surface', ({ canManage, affiliated, row, expected }) => {
    expect(toPersonTap(canManage, affiliated, row)).toBe(expected);
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

describe('toHubOrigin', () => {
  it('sends an affiliated viewer back to the Gruppenverzeichnis', () => {
    expect(toHubOrigin(true).to).toBe('/groups');
  });

  it('sends a viewer without a Verbindung somewhere she may go', () => {
    expect(toHubOrigin(false).to).toBe('/profile');
  });
});

describe('toTakenTones', () => {
  it('collects every other Gruppe tone and skips the one being edited', () => {
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
  it('warns when another Gruppe already wears the tone', () => {
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
  it('warns that a future appointment grants nothing yet', () => {
    expect(toAppointConsequence('Anna Kaiser', '2026-09-01', '2026-03-01')).toContain(
      'vorher nicht',
    );
  });

  it('spells out what a running Gruppen-Admin may do', () => {
    expect(toAppointConsequence('Anna Kaiser', '2026-03-01', '2026-03-01')).toContain(
      'Leute aufnehmen und beenden',
    );
  });
});

describe('toAdminEndConsequence', () => {
  it('dates a future end and keeps the Zugehörigkeit out of it', () => {
    const consequence = toAdminEndConsequence('Anna Kaiser', '2026-09-01', '2026-03-01');

    expect(consequence).toContain('Ab dem 01.09.2026');
    expect(consequence).toContain('Zugehörigkeit zur Gruppe bleibt davon unberührt');
  });

  it('speaks of an end today in the present tense', () => {
    expect(toAdminEndConsequence('Anna Kaiser', '2026-03-01', '2026-03-01')).toContain('ab sofort');
  });
});

describe('toAdminEndFacts', () => {
  it('answers who, where, with which Funktion and until when', () => {
    const facts = toAdminEndFacts(
      hubAdmin({ firstName: 'Anna', lastName: 'Kaiser', function: 'Trainerin' }),
      'Tanzgarde',
      '2026-02-28',
    );

    expect(facts).toEqual([
      { label: 'Person', value: 'Anna Kaiser' },
      { label: 'Gruppe', value: 'Tanzgarde' },
      { label: 'Funktion', value: 'Trainerin' },
      { label: 'Admin seit', value: '01.01.2019' },
      { label: 'Letzter Tag', value: '28.02.2026' },
    ]);
  });

  it('names the missing Funktion instead of leaving the row blank', () => {
    expect(toAdminEndFacts(hubAdmin({ function: null }), 'Tanzgarde', null)[2]).toEqual({
      label: 'Funktion',
      value: 'ohne Funktion',
    });
  });

  it('says the last day is still open while none is chosen', () => {
    expect(toAdminEndFacts(hubAdmin({}), 'Tanzgarde', null)[4]).toEqual({
      label: 'Letzter Tag',
      value: 'noch offen',
    });
  });
});

describe('toLastAdminWarning', () => {
  it.each([
    { case: 'the last running admin', runningAdmins: 1, warned: true },
    { case: 'a Gruppe already without one', runningAdmins: 0, warned: true },
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
      'Das bist du. Danach kannst du die Gruppe nur noch lesen — neu ernennen kann dich die Gruppenverwaltung. Anna kann ab sofort nicht mehr pflegen.',
    );
  });

  it('keeps both warnings in one paragraph when she is also the last admin', () => {
    const paragraph = toAdminEndParagraph('Anna kann ab sofort nicht mehr pflegen.', true, 1);

    expect(paragraph).toContain('Das bist du.');
    expect(paragraph).toContain('Anna kann ab sofort nicht mehr pflegen.');
    expect(paragraph).toContain('hat diese Gruppe keinen Gruppen-Admin mehr');
  });
});

describe('toSelfAdminEndedMessage', () => {
  it('dates a removal that has not happened yet', () => {
    expect(toSelfAdminEndedMessage('Tanzgarde', '2026-09-01', '2026-03-01')).toBe(
      'Ab dem 01.09.2026 bist du nicht mehr Gruppen-Admin von Tanzgarde. Lesen kannst du sie weiter — neu ernennen kann dich die Gruppenverwaltung.',
    );
  });

  it('reports a removal that takes effect today in the present tense', () => {
    expect(toSelfAdminEndedMessage('Tanzgarde', '2026-03-01', '2026-03-01')).toBe(
      'Du bist nicht mehr Gruppen-Admin von Tanzgarde. Lesen kannst du sie weiter — neu ernennen kann dich die Gruppenverwaltung.',
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

  it('wears the Funktion of an admin who has one', () => {
    expect(toPersonAccent(groupPerson({ groupAdminId: 4, adminFunction: 'Trainerin' }))).toBe(
      'Trainerin',
    );
  });

  it('falls back to the bare office for an admin without a Funktion', () => {
    expect(toPersonAccent(groupPerson({ groupAdminId: 4 }))).toBe('Gruppen-Admin');
  });
});

describe('toPersonMetaLine', () => {
  it('keeps the dates to the Verwaltung', () => {
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
  it('names the Zugehörigkeit of a plain member', () => {
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

describe('toPeekAdminIntent', () => {
  it('offers nothing to a viewer who may not manage the Gruppe', () => {
    expect(toPeekAdminIntent(groupPerson({ groupAdminId: 4 }), false)).toBe('none');
  });

  it('offers to end the office of a standing Gruppen-Admin', () => {
    expect(toPeekAdminIntent(groupPerson({ groupAdminId: 4 }), true)).toBe('endAdmin');
  });

  it('offers to promote a member who holds no office', () => {
    expect(toPeekAdminIntent(groupPerson({}), true)).toBe('promote');
  });

  it('offers no promotion to someone who is not in the Gruppe', () => {
    expect(
      toPeekAdminIntent(groupPerson({ groupMembershipId: null, memberSince: null }), true),
    ).toBe('none');
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
      'Mara Lenz ist ab dem 01.10.2026 dabei — und Gruppen-Admin.',
    );
  });
});

describe('toJoinAsAdminConsequence', () => {
  it('spells out the care duties for a day that has come', () => {
    expect(toJoinAsAdminConsequence('Mara', '2026-09-22', '2026-09-22')).toBe(
      'Mara gehört ab dem 22.09.2026 zur Gruppe und darf sie pflegen: Beschreibung ändern, Leute aufnehmen und beenden.',
    );
  });

  it('holds the care duties back until the day comes', () => {
    expect(toJoinAsAdminConsequence('Mara', '2026-10-01', '2026-09-22')).toBe(
      'Ab dem 01.10.2026 steht Mara in der Gruppe und darf sie pflegen — vorher nicht.',
    );
  });
});
