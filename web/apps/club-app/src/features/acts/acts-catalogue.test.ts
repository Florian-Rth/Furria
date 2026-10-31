import { describe, expect, it } from 'vitest';
import type { ActKind, CatalogueAct } from '@/features/running-order/schemas';
import { filterCountsOf, knownGroupsOf, matchesQuery, visibleSectionsOf } from './acts-catalogue';

const act = (
  actId: number,
  name: string,
  kind: ActKind | null,
  group: { groupId: number; name: string } | null,
  archived = false,
): CatalogueAct => ({
  actId,
  name,
  kind,
  group: group === null ? null : { ...group, tone: null, icon: null, picture: null },
  sessionYear: null,
  closed: false,
  archived,
  cast: [
    {
      personId: actId,
      firstName: 'Jörg',
      lastName: `Müller${actId}`,
      portrait: null,
      absent: false,
    },
  ],
  added: [],
  removed: [],
  wishes: [],
});

const garde = { groupId: 1, name: 'Tanzgarde' };
const elferrat = { groupId: 2, name: 'Elferrat' };

const acts = [
  act(1, 'Showtanz', 'dance', garde),
  act(2, 'Marschtanz', 'dance', garde),
  act(3, 'Einmarsch', 'point', elferrat),
  act(4, 'Begrüßung', 'speech', null),
  act(5, 'Finale', 'point', null),
  act(6, 'Alter Tanz', 'dance', garde, true),
  act(7, 'Ohne Art', null, null),
];

describe('filterCountsOf', () => {
  it('counts active acts per filter and archived ones only under archive', () => {
    expect(filterCountsOf(acts)).toEqual({
      all: 6,
      dance: 2,
      speech: 1,
      music: 0,
      show: 0,
      points: 3,
      archive: 1,
    });
  });
});

describe('matchesQuery', () => {
  it.each([
    [null, true],
    ['  ', true],
    ['marsch', true],
    ['tanzgarde', true],
    ['jorg muller2', true],
    ['ballett', false],
  ])('matches %s → %s', (query, expected) => {
    expect(matchesQuery(acts[1] as CatalogueAct, query)).toBe(expected);
  });
});

describe('visibleSectionsOf', () => {
  it('groups by group name, sorts acts by name and puts group-less acts last', () => {
    const sections = visibleSectionsOf(acts, 'all', null).map((section) => ({
      id: section.id,
      acts: section.acts.map((candidate) => candidate.actId),
    }));

    expect(sections).toEqual([
      { id: 'group:2', acts: [3] },
      { id: 'group:1', acts: [2, 1] },
      { id: 'points', acts: [4, 5, 7] },
    ]);
  });

  it('applies the filter and the query together', () => {
    const sections = visibleSectionsOf(acts, 'dance', 'show').map((section) =>
      section.acts.map((candidate) => candidate.actId),
    );

    expect(sections).toEqual([[1]]);
  });

  it('shows archived acts only under archive', () => {
    const sections = visibleSectionsOf(acts, 'archive', null).map((section) =>
      section.acts.map((candidate) => candidate.actId),
    );

    expect(sections).toEqual([[6]]);
  });
});

describe('knownGroupsOf', () => {
  it('merges the listed groups with the groups of the acts, once each, by name', () => {
    const listed = [{ groupId: 9, name: 'Zugabe', tone: null, icon: null, picture: null }];

    expect(knownGroupsOf(listed, acts).map((group) => group.groupId)).toEqual([2, 1, 9]);
  });
});
