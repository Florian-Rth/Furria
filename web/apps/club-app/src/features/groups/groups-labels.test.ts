import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/lib/api/schemas';
import {
  ALL_GROUPS_FILTER_ID,
  filterGroups,
  RECRUITING_FILTER_ID,
  SETTLED_FILTER_ID,
  toGroupContactLine,
  toGroupCountLabel,
  toGroupKindLabel,
  toGroupLeadLine,
  toGroupStandingChips,
  toGroupsIntroSentence,
  toGroupsSections,
  toNoGroupMatchLine,
  toPersonUnitLabel,
  toRecruitingContactLine,
  toRecruitingContactSegments,
  toRecruitingFilterOptions,
} from './groups-labels';
import type { GroupSummary } from './schemas';

const person = (personId: number, firstName: string, lastName = 'Kaiser'): PersonRef => ({
  personId,
  firstName,
  lastName,
});

const summary = (overrides: Partial<GroupSummary> & { groupId: number }): GroupSummary => ({
  name: 'Große Garde',
  description: '',
  isRecruiting: false,
  groupKindName: null,
  foundedYear: null,
  tone: null,
  memberCount: 0,
  memberPreview: [],
  admins: [],
  viewerIsMember: false,
  viewerIsAdmin: false,
  ...overrides,
});

describe('toPersonUnitLabel', () => {
  it.each([
    { count: 0, expected: 'Personen' },
    { count: 1, expected: 'Person' },
    { count: 18, expected: 'Personen' },
  ])('names the unit for $count', ({ count, expected }) => {
    expect(toPersonUnitLabel(count)).toBe(expected);
  });
});

describe('toRecruitingContactSegments', () => {
  it('offers no person to click when the Gruppe has no admin', () => {
    expect(toRecruitingContactSegments([])).toEqual([
      { kind: 'text', text: 'Diese Gruppe hat noch keine Ansprechperson.' },
    ]);
  });

  it('carries the one admin as a person segment', () => {
    expect(toRecruitingContactSegments([person(18, 'Anna')])).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna', lastName: 'Kaiser' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('carries both admins as person segments', () => {
    expect(toRecruitingContactSegments([person(18, 'Anna'), person(19, 'Katrin')])).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna', lastName: 'Kaiser' },
      { kind: 'text', text: ' oder ' },
      { kind: 'person', personId: 19, firstName: 'Katrin', lastName: 'Kaiser' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('carries two of three and leaves the rest unlinked', () => {
    expect(
      toRecruitingContactSegments([person(18, 'Anna'), person(19, 'Katrin'), person(20, 'Jens')]),
    ).toEqual([
      { kind: 'text', text: 'Melde dich bei ' },
      { kind: 'person', personId: 18, firstName: 'Anna', lastName: 'Kaiser' },
      { kind: 'text', text: ', ' },
      { kind: 'person', personId: 19, firstName: 'Katrin', lastName: 'Kaiser' },
      { kind: 'text', text: ' oder einer der anderen Gruppen-Admins.' },
    ]);
  });
});

describe('toRecruitingContactLine', () => {
  it('asks for an Ansprechperson when the Gruppe has no admin', () => {
    expect(toRecruitingContactLine([])).toBe('Diese Gruppe hat noch keine Ansprechperson.');
  });

  it('names the one admin in full — the club holds four Jörgs', () => {
    expect(toRecruitingContactLine([person(18, 'Jörg', 'Hoffmann')])).toBe(
      'Melde dich bei Jörg Hoffmann.',
    );
  });

  it('tells two admins of the same first name apart', () => {
    expect(
      toRecruitingContactLine([person(18, 'Jörg', 'Hoffmann'), person(19, 'Jörg', 'Krüger')]),
    ).toBe('Melde dich bei Jörg Hoffmann oder Jörg Krüger.');
  });

  it('names two of three and points at the rest', () => {
    expect(
      toRecruitingContactLine([person(18, 'Anna'), person(19, 'Katrin'), person(20, 'Jens')]),
    ).toBe('Melde dich bei Anna Kaiser, Katrin Kaiser oder einer der anderen Gruppen-Admins.');
  });
});

describe('filterGroups', () => {
  const groups: readonly GroupSummary[] = [
    summary({ groupId: 1, name: 'Große Garde', isRecruiting: true }),
    summary({ groupId: 2, name: 'Elferrat' }),
    summary({ groupId: 3, name: 'Küche und Theke', isRecruiting: true }),
  ];

  const ids = (query: string, status: string): number[] =>
    filterGroups(groups, { query, status }).map((group) => group.groupId);

  it('keeps every Gruppe under Alle', () => {
    expect(ids('', ALL_GROUPS_FILTER_ID)).toEqual([1, 2, 3]);
  });

  it('keeps only the recruiting Gruppen', () => {
    expect(ids('', RECRUITING_FILTER_ID)).toEqual([1, 3]);
  });

  it('keeps only the settled Gruppen', () => {
    expect(ids('', SETTLED_FILTER_ID)).toEqual([2]);
  });

  it('folds the ß and the umlaut when matching a name', () => {
    expect(ids('grosse', ALL_GROUPS_FILTER_ID)).toEqual([1]);
    expect(ids('kuche', ALL_GROUPS_FILTER_ID)).toEqual([3]);
  });

  it('applies the query inside the chosen chip', () => {
    expect(ids('elferrat', RECRUITING_FILTER_ID)).toEqual([]);
  });
});

describe('toRecruitingFilterOptions', () => {
  it('counts all, recruiting and settled from the same list', () => {
    const groups: readonly GroupSummary[] = [
      summary({ groupId: 1, isRecruiting: true }),
      summary({ groupId: 2 }),
      summary({ groupId: 3 }),
    ];

    expect(toRecruitingFilterOptions(groups).map((option) => [option.id, option.count])).toEqual([
      [ALL_GROUPS_FILTER_ID, 3],
      [RECRUITING_FILTER_ID, 1],
      [SETTLED_FILTER_ID, 2],
    ]);
  });
});

describe('toNoGroupMatchLine', () => {
  it('names the query when there is one', () => {
    expect(toNoGroupMatchLine('  Garde ', ALL_GROUPS_FILTER_ID)).toContain('Garde');
  });

  it('explains the chip when only a chip narrows the list', () => {
    expect(toNoGroupMatchLine('', RECRUITING_FILTER_ID)).toBe(
      'Keine Gruppe sucht Verstärkung. Wähle „Alle“, um alle anzuzeigen.',
    );
  });

  it('falls back to the cold case under Alle', () => {
    expect(toNoGroupMatchLine('', ALL_GROUPS_FILTER_ID)).toBe(
      'Es sind noch keine Gruppen angelegt.',
    );
  });
});

describe('toGroupsIntroSentence', () => {
  it.each([
    { case: 'one Gruppe, none recruiting', total: 1, recruiting: 0 },
    { case: 'one Gruppe recruiting', total: 1, recruiting: 1 },
    { case: 'several Gruppen, one recruiting', total: 7, recruiting: 1 },
    { case: 'several Gruppen recruiting', total: 7, recruiting: 3 },
    { case: 'several Gruppen, none recruiting', total: 7, recruiting: 0 },
  ])('never prints a bare count as a subject for $case', ({ total, recruiting }) => {
    expect(toGroupsIntroSentence(total, recruiting)).not.toMatch(/(^|\. )1 (Gruppe|davon)/);
  });

  it('counts the Gruppen and the openings', () => {
    expect(toGroupsIntroSentence(7, 3)).toBe(
      '7 Gruppen tragen die Session. 3 davon suchen Verstärkung.',
    );
  });

  it('spells the single Gruppe and the single opening as words', () => {
    expect(toGroupsIntroSentence(1, 1)).toBe(
      'Eine Gruppe trägt die Session. Eine davon sucht Verstärkung.',
    );
  });

  it('says so when nobody is looking', () => {
    expect(toGroupsIntroSentence(7, 0)).toBe(
      '7 Gruppen tragen die Session. Keine davon sucht Verstärkung.',
    );
  });
});

describe('toGroupStandingChips', () => {
  it('marks nothing for a Gruppe the viewer has no standing in', () => {
    expect(toGroupStandingChips(summary({ groupId: 4 }))).toEqual([]);
  });

  it('marks a Gruppe the viewer belongs to', () => {
    expect(toGroupStandingChips(summary({ groupId: 4, viewerIsMember: true }))).toHaveLength(1);
  });

  it('marks both facts when the viewer belongs to a Gruppe she also administers', () => {
    expect(
      toGroupStandingChips(summary({ groupId: 4, viewerIsMember: true, viewerIsAdmin: true })),
    ).toHaveLength(2);
  });

  it('marks the Gruppen-Admin who is not a member', () => {
    const chips = toGroupStandingChips(summary({ groupId: 4, viewerIsAdmin: true }));

    expect(chips).toHaveLength(1);
    expect(chips[0]?.label).toBe('Gruppen-Admin');
  });
});

describe('toGroupsSections', () => {
  it('leaves the rack empty when no Gruppe is listed', () => {
    expect(toGroupsSections([])).toEqual([]);
  });

  it('gives a viewer in no Gruppe one unlabelled section and no empty heading', () => {
    const groups = [summary({ groupId: 1 }), summary({ groupId: 2 })];
    const sections = toGroupsSections(groups);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeNull();
    expect(sections[0]?.groups).toEqual(groups);
  });

  it('titles the one section when the viewer belongs to every Gruppe', () => {
    const groups = [
      summary({ groupId: 1, viewerIsMember: true }),
      summary({ groupId: 2, viewerIsAdmin: true }),
    ];
    const sections = toGroupsSections(groups);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe('Meine Gruppen');
    expect(sections[0]?.groups).toEqual(groups);
  });

  it('puts meine Gruppen first and keeps the server order inside each section', () => {
    const sections = toGroupsSections([
      summary({ groupId: 1, name: 'Ältestenrat' }),
      summary({ groupId: 2, name: 'Elferrat', viewerIsAdmin: true }),
      summary({ groupId: 3, name: 'Musikzug' }),
      summary({ groupId: 4, name: 'Tanzgarde', viewerIsMember: true }),
    ]);

    expect(sections.map((section) => section.title)).toEqual(['Meine Gruppen', 'Alle Gruppen']);
    expect(sections[0]?.groups.map((group) => group.name)).toEqual(['Elferrat', 'Tanzgarde']);
    expect(sections[1]?.groups.map((group) => group.name)).toEqual(['Ältestenrat', 'Musikzug']);
  });

  it('breaks the rack exactly once', () => {
    const sections = toGroupsSections([
      summary({ groupId: 1, viewerIsMember: true }),
      summary({ groupId: 2 }),
      summary({ groupId: 3, viewerIsAdmin: true }),
      summary({ groupId: 4 }),
    ]);

    expect(sections).toHaveLength(2);
  });
});

describe('toGroupLeadLine', () => {
  it.each([
    { admins: [], expected: 'Noch ohne Gruppen-Admin' },
    { admins: [person(1, 'Anna')], expected: 'Geleitet von Anna Kaiser' },
    {
      admins: [person(1, 'Anna'), person(2, 'Katrin', 'Sommer')],
      expected: 'Geleitet von Anna Kaiser und Katrin Sommer',
    },
    {
      admins: [person(1, 'Anna'), person(2, 'Katrin', 'Sommer'), person(3, 'Mara', 'Lenz')],
      expected: 'Geleitet von Anna Kaiser und 2 weitere',
    },
    {
      admins: [
        person(1, 'Anna'),
        person(2, 'Katrin', 'Sommer'),
        person(3, 'Mara', 'Lenz'),
        person(4, 'Nina', 'Orth'),
      ],
      expected: 'Geleitet von Anna Kaiser und 3 weitere',
    },
  ])('names who runs a Gruppe with $admins.length admins', ({ admins, expected }) => {
    expect(toGroupLeadLine(admins)).toBe(expected);
  });
});

describe('toGroupContactLine', () => {
  it('asks the reader to get in touch while the Gruppe is recruiting', () => {
    expect(
      toGroupContactLine(summary({ groupId: 1, isRecruiting: true, admins: [person(1, 'Anna')] })),
    ).toBe('Melde dich bei Anna Kaiser.');
  });

  it('only names who runs a settled Gruppe', () => {
    expect(toGroupContactLine(summary({ groupId: 1, admins: [person(1, 'Anna')] }))).toBe(
      'Geleitet von Anna Kaiser',
    );
  });
});

describe('toGroupKindLabel', () => {
  it.each([
    { groupKindName: null, expected: null },
    { groupKindName: '   ', expected: null },
    { groupKindName: '  Garden ', expected: 'Garden' },
    { groupKindName: 'Garden', expected: 'Garden' },
  ])('names the Gruppenart $groupKindName', ({ groupKindName, expected }) => {
    expect(toGroupKindLabel(groupKindName)).toBe(expected);
  });
});

describe('toGroupCountLabel', () => {
  it.each([
    { count: 0, expected: '0 Gruppen' },
    { count: 1, expected: '1 Gruppe' },
    { count: 7, expected: '7 Gruppen' },
  ])('counts $count', ({ count, expected }) => {
    expect(toGroupCountLabel(count)).toBe(expected);
  });
});
