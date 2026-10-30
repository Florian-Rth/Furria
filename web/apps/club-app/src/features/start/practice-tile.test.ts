import { describe, expect, it } from 'vitest';
import type { MyAct } from '@/features/acts/schemas';
import { boardPanelsOf, practiceReachOf } from './practice-tile';
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
