import { describe, expect, it } from 'vitest';
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
  toHistoryEntries,
  toHubHeadline,
  toHubId,
  toJoinConsequence,
  toJoinQuickChoices,
  toLastAdminWarning,
  toMemberAddedMessage,
  toMembershipEndedMessage,
  toSearchCapLine,
  toSearchTerm,
  toSelfAdminEndedMessage,
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

describe('toHubHeadline', () => {
  it('carries nothing but the fallback title while the hub is still loading', () => {
    expect(toHubHeadline(undefined, 12)).toEqual({
      title: 'Meine Gruppe',
      eyebrow: null,
      openness: null,
      subline: null,
    });
  });

  it('dates the viewer own standing from her own row', () => {
    const headline = toHubHeadline(
      hubDetails({
        members: [
          hubMember({ personId: 12, since: '2016-11-11' }),
          hubMember({ groupMembershipId: 8, personId: 44 }),
        ],
      }),
      12,
    );

    expect(headline).toEqual({
      title: 'Tanzgarde',
      eyebrow: 'deine Gruppe seit 2016/17',
      openness: { label: 'sucht gerade niemanden', tone: 'neutral', dot: false },
      subline: '2 Personen · kein Gruppen-Admin',
    });
  });

  it('claims the Gruppe without a date for an admin who is in no row of it', () => {
    const headline = toHubHeadline(
      hubDetails({
        isRecruiting: true,
        viewerIsAdmin: true,
        members: [hubMember({ personId: 44 })],
        admins: [hubAdmin({ personId: 12 })],
      }),
      12,
    );

    expect(headline).toEqual({
      title: 'Tanzgarde',
      eyebrow: 'deine Gruppe',
      openness: { label: 'sucht Verstärkung', tone: 'gold', dot: true },
      subline: 'du pflegst sie · 1 Person · 1 Gruppen-Admin',
    });
  });

  it('says nothing about pflegen to a member who is not a Gruppen-Admin', () => {
    const headline = toHubHeadline(
      hubDetails({ members: [hubMember({ personId: 12, since: '2020-11-11' })] }),
      12,
    );

    expect(headline.subline).toBe('1 Person · kein Gruppen-Admin');
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
