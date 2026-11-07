import type { SetupFacts } from '@furria/studio/setup-stages';
import {
  leaveGateOf,
  nextPlaceOf,
  previousStageOf,
  stageCellsOf,
  stageGateOf,
} from '@furria/studio/setup-stages';
import { describe, expect, it } from 'vitest';

const progress = { total: 3, unnamed: 1 };

const ready: SetupFacts = {
  hasMusic: true,
  videoChosen: true,
  videoReady: true,
  videoPlaced: true,
  progress,
};

describe('nextPlaceOf / previousStageOf', () => {
  it('walks the stages in order, ends in the finish and has no stage before the video', () => {
    expect(nextPlaceOf('video')).toBe('borders');
    expect(nextPlaceOf('names')).toBe('finish');
    expect(previousStageOf('video')).toBeNull();
    expect(previousStageOf('names')).toBe('borders');
    expect(previousStageOf('finish')).toBeNull();
  });
});

describe('stageGateOf', () => {
  it.each([
    ['names', { ...ready, hasMusic: false }, 'noMusic'],
    ['borders', { ...ready, videoChosen: false }, 'noVideo'],
    ['borders', { ...ready, videoReady: false }, 'videoWaiting'],
    ['borders', { ...ready, videoPlaced: false }, 'notPlaced'],
    ['names', { ...ready, progress: { ...progress, total: 0 } }, 'noSteps'],
    ['finish', { ...ready, progress: { ...progress, total: 0 } }, 'noSteps'],
    ['finish', ready, 'open'],
    ['video', { ...ready, hasMusic: false }, 'open'],
  ] as const)('%s with %o → %s', (place, facts, gate) => {
    expect(stageGateOf(place, facts)).toBe(gate);
  });
});

describe('leaveGateOf', () => {
  it.each([
    ['video', { ...ready, videoChosen: false }, 'noVideo'],
    ['video', { ...ready, videoPlaced: false }, 'notPlaced'],
    ['borders', { ...ready, progress: { ...progress, total: 0 } }, 'noSteps'],
    ['names', ready, 'open'],
  ] as const)('leaving %s with %o → %s', (place, facts, gate) => {
    expect(leaveGateOf(place, facts)).toBe(gate);
  });
});

describe('stageCellsOf', () => {
  it('shows real completion, not the position of the current stage', () => {
    const cells = stageCellsOf('borders', ready);

    expect(cells.map((cell) => cell.state)).toEqual(['done', 'done', 'open']);
    expect(cells.filter((cell) => cell.current).map((cell) => cell.stage)).toEqual(['borders']);
  });

  it('locks what needs a placed video and marks no stage current on the finish', () => {
    const cells = stageCellsOf('finish', { ...ready, videoPlaced: false });

    expect(cells.map((cell) => cell.state)).toEqual(['open', 'locked', 'locked']);
    expect(cells.some((cell) => cell.current)).toBe(false);
  });

  it('counts no stage done without steps', () => {
    const cells = stageCellsOf('borders', { ...ready, progress: { total: 0, unnamed: 0 } });

    expect(cells.map((cell) => cell.state)).toEqual(['done', 'open', 'locked']);
  });
});
