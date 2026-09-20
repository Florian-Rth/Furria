import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/lib/api/schemas';
import {
  ALL_GROUPS_FILTER_ID,
  filterGroups,
  RECRUITING_FILTER_ID,
  SETTLED_FILTER_ID,
  toGroupStandingChips,
  toGroupStandings,
  toGroupsIntroSentence,
  toGroupsLead,
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
  memberCount: 0,
  memberPreview: [],
  admins: [],
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
      { kind: 'text', text: 'Diese Gruppe sucht noch eine Ansprechperson.' },
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
    expect(toRecruitingContactLine([])).toBe('Diese Gruppe sucht noch eine Ansprechperson.');
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
      'Gerade sucht keine Gruppe Verstärkung. Wähle „Alle“, um wieder alle zu sehen.',
    );
  });

  it('falls back to the cold case under Alle', () => {
    expect(toNoGroupMatchLine('', ALL_GROUPS_FILTER_ID)).toBe(
      'Im Verzeichnis steht gerade keine Gruppe.',
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
      '7 Gruppen tragen die Session. 3 davon suchen gerade Verstärkung.',
    );
  });

  it('spells the single Gruppe and the single opening as words', () => {
    expect(toGroupsIntroSentence(1, 1)).toBe(
      'Eine Gruppe trägt die Session. Eine davon sucht gerade Verstärkung.',
    );
  });

  it('says so when nobody is looking', () => {
    expect(toGroupsIntroSentence(7, 0)).toBe(
      '7 Gruppen tragen die Session. Gerade sucht keine davon Verstärkung.',
    );
  });
});

describe('toGroupsLead', () => {
  it('counts the Gruppen that are looking for people', () => {
    expect(
      toGroupsLead([
        summary({ groupId: 1, isRecruiting: true }),
        summary({ groupId: 2, isRecruiting: false }),
        summary({ groupId: 3, isRecruiting: true }),
      ]),
    ).toBe('3 Gruppen tragen die Session. 2 davon suchen gerade Verstärkung.');
  });
});

describe('toGroupStandings', () => {
  it('keys every standing by its Gruppe', () => {
    const standings = toGroupStandings([
      { groupId: 4, name: 'Elferrat', isMember: true, isAdmin: false },
      { groupId: 9, name: 'Musikzug', isMember: false, isAdmin: true },
    ]);

    expect(standings.get(4)).toEqual({ isMember: true, isAdmin: false });
    expect(standings.get(9)).toEqual({ isMember: false, isAdmin: true });
    expect(standings.get(11)).toBeUndefined();
  });
});

describe('toGroupStandingChips', () => {
  it('marks nothing for a Gruppe the viewer has no standing in', () => {
    expect(toGroupStandingChips(undefined)).toEqual([]);
  });

  it('marks a Gruppe the viewer belongs to', () => {
    expect(toGroupStandingChips({ isMember: true, isAdmin: false })).toHaveLength(1);
  });

  it('marks both facts when the viewer belongs to a Gruppe she also administers', () => {
    expect(toGroupStandingChips({ isMember: true, isAdmin: true })).toHaveLength(2);
  });

  it('marks the Gruppen-Admin who is not a member', () => {
    const chips = toGroupStandingChips({ isMember: false, isAdmin: true });

    expect(chips).toHaveLength(1);
    expect(chips[0]?.label).toBe('Gruppen-Admin');
  });
});
