import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import {
  catalogueRowStateOf,
  catalogueSectionsOf,
  pickedInSectionOf,
  previousEveningsOf,
} from './planner-catalogue';

const catalogueAct = (
  actId: number,
  name: string,
  group: { groupId: number; name: string } | null,
  archived = false,
): CatalogueAct => ({
  actId,
  name,
  kind: group === null ? 'point' : 'dance',
  group: group === null ? null : { ...group, tone: null, icon: null, picture: null },
  archived,
  cast: [],
  added: [],
  removed: [],
  wishes: [],
});

const garde = { groupId: 1, name: 'Tanzgarde' };
const ballett = { groupId: 2, name: 'Männerballett' };

const acts = [
  catalogueAct(1, 'Gardetanz', garde),
  catalogueAct(2, 'Ballett', ballett),
  catalogueAct(3, 'Einmarsch', null),
  catalogueAct(4, 'Marsch', garde),
  catalogueAct(5, 'Alt', garde, true),
  catalogueAct(6, 'Begrüßung', null),
];

const line = (actId: number, placed: boolean): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Nummer ${actId}`, kind: 'dance', group: null, cast: [] },
  placed,
  pinned: false,
  blockKey: null,
});

const draftOf = (lines: DraftLine[]): RunningOrderDraft => ({
  version: null,
  lines,
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

const draft = draftOf([line(4, true)]);

describe('catalogueSectionsOf', () => {
  it('lists every live act, groups by name, Ablaufpunkte last', () => {
    expect(
      catalogueSectionsOf(acts).map((section) => [
        section.id,
        section.acts.map((act) => act.actId),
      ]),
    ).toEqual([
      ['group:2', [2]],
      ['group:1', [1, 4]],
      ['points', [6, 3]],
    ]);
  });
});

describe('catalogueRowStateOf', () => {
  const evening = draftOf([line(1, true), line(2, false), line(3, true)]);

  it.each([
    [9, { kind: 'off' }],
    [1, { kind: 'placed', place: 1 }],
    [3, { kind: 'placed', place: 2 }],
    [2, { kind: 'new' }],
  ])('act %i', (actId, expected) => {
    expect(catalogueRowStateOf(evening, actId)).toEqual(expected);
  });
});

describe('pickedInSectionOf', () => {
  it('counts the section acts already in the evening', () => {
    const [, gardeSection] = catalogueSectionsOf(acts);

    expect(gardeSection === undefined ? null : pickedInSectionOf(gardeSection, draft)).toBe(1);
  });
});

describe('previousEveningsOf', () => {
  it('offers other evenings with live acts, newest first, counting what is still missing', () => {
    const summaries = [
      { eventId: 7, title: 'Heute', startsAt: '2027-02-01T19:00:00+01:00', actIds: [1] },
      { eventId: 8, title: 'Alt', startsAt: '2026-02-01T19:00:00+01:00', actIds: [1, 2, 5] },
      { eventId: 9, title: 'Neu', startsAt: '2026-11-11T19:00:00+01:00', actIds: [2, 3] },
      { eventId: 10, title: 'Fertig', startsAt: '2026-12-01T19:00:00+01:00', actIds: [4] },
      { eventId: 11, title: 'Archiv', startsAt: '2026-12-02T19:00:00+01:00', actIds: [5] },
    ];

    expect(
      previousEveningsOf(summaries, 7, acts, draft).map((evening) => [
        evening.eventId,
        evening.missing,
      ]),
    ).toEqual([
      [10, 0],
      [9, 2],
      [8, 2],
    ]);
  });
});
