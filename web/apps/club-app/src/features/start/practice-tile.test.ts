import { describe, expect, it } from 'vitest';
import type { MyAct } from '@/features/acts/schemas';
import { boardPanelsOf, practiceMetaOf, practiceReachOf, practisableActsOf } from './practice-tile';
import type { StartPanel } from './schemas';

const act = (actId: number): MyAct => ({
  actId,
  name: `Tanz ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  group: null,
  viewerInCast: true,
  viewerLeads: false,
  playable: true,
  cast: [],
  editors: [],
  nextEvening: null,
  nextTraining: null,
});

const calendar: StartPanel = { kind: 'calendar', shownCount: 0, entries: [] };
const gallery: StartPanel = { kind: 'gallery', shownCount: 0, albums: [] };

describe('boardPanelsOf', () => {
  it('adds no practice tile when the viewer practises no act', () => {
    expect(boardPanelsOf([calendar, gallery], []).map((panel) => panel.kind)).toEqual([
      'calendar',
      'gallery',
    ]);
  });

  it('places the practice tile right after the calendar', () => {
    expect(boardPanelsOf([calendar, gallery], [act(1)]).map((panel) => panel.kind)).toEqual([
      'calendar',
      'practice',
      'gallery',
    ]);
  });

  it('leads with the practice tile when there is no calendar', () => {
    expect(boardPanelsOf([gallery], [act(1)]).map((panel) => panel.kind)).toEqual([
      'practice',
      'gallery',
    ]);
  });

  it.each<[number, number]>([
    [2, 2],
    [3, 3],
    [4, 4],
    [6, 3],
  ])('shows %s acts as %s lines', (count, shown) => {
    const acts = Array.from({ length: count }, (_, index) => act(index + 1));
    const [practice] = boardPanelsOf([], acts);

    expect(practice?.shownCount).toBe(shown);
  });
});

describe('practiceReachOf', () => {
  it('opens a single act directly', () => {
    expect(practiceReachOf([act(4)])).toEqual({ kind: 'act', act: act(4) });
  });

  it('lets the viewer choose among several acts', () => {
    expect(practiceReachOf([act(4), act(5)])).toEqual({ kind: 'sheet' });
  });
});

describe('practisableActsOf', () => {
  it.each<[string, Partial<MyAct>, boolean]>([
    ['a playable cast act', { playable: true, viewerInCast: true }, true],
    [
      'a playable act the viewer leads',
      { playable: true, viewerInCast: false, viewerLeads: true },
      true,
    ],
    ['an act without music', { playable: false, viewerInCast: true }, false],
    ['a led act without music', { playable: false, viewerInCast: false, viewerLeads: true }, false],
  ])('keeps %s: %s', (_, overrides, kept) => {
    const candidate = { ...act(7), ...overrides };

    expect(practisableActsOf([candidate]).map((each) => each.actId)).toEqual(kept ? [7] : []);
  });
});

describe('practiceMetaOf', () => {
  it.each<[string, Partial<MyAct>, { group: string | null; kind: MyAct['kind'] }]>([
    ['no group', { group: null }, { group: null, kind: 'dance' }],
    [
      'a group named apart',
      {
        name: 'Polka',
        group: { groupId: 1, name: 'Garde', tone: null, icon: null, picture: null },
      },
      { group: 'Garde', kind: 'dance' },
    ],
    [
      'a group named like the act',
      {
        name: 'Männerballett',
        group: { groupId: 1, name: 'Männerballett', tone: null, icon: null, picture: null },
      },
      { group: null, kind: 'dance' },
    ],
    [
      'a group named like the act in other case and spacing',
      {
        name: 'männerballett ',
        group: { groupId: 1, name: 'Männerballett', tone: null, icon: null, picture: null },
      },
      { group: null, kind: 'dance' },
    ],
    ['no kind', { kind: null, group: null }, { group: null, kind: null }],
  ])('names %s', (_, overrides, expected) => {
    expect(practiceMetaOf({ ...act(3), ...overrides })).toEqual(expected);
  });
});
