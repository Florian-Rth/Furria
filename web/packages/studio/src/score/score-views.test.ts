import { entranceDelayOf } from '@furria/studio/score-entrance';
import type { FormationDot } from '@furria/studio/score-formation';
import type { ScoreModel } from '@furria/studio/score-model';
import type { ScoreStep } from '@furria/studio/score-steps';
import { scoreGroupsOf, scoreYouOf } from '@furria/studio/score-views';
import { describe, expect, it } from 'vitest';

const stepOf = (stepId: number, partId: number | null, start: number | null): ScoreStep => ({
  stepId,
  number: stepId,
  name: '',
  description: null,
  range: start === null ? null : { start, end: start + 4 },
  partId,
  partIndex: partId === null ? null : 0,
  counts: null,
  movement: false,
  video: null,
  flag: null,
});

const dotOf = (spotId: number, x: number): FormationDot => ({
  spotId,
  number: spotId,
  firstName: null,
  x,
  y: 0.5,
  own: spotId === 7,
  open: false,
});

const first = stepOf(1, 10, 0);
const empty = stepOf(2, 10, 4);
const loose = stepOf(3, null, 8);

const model: ScoreModel = {
  segments: [],
  length: 12,
  marks: [],
  paths: [],
  parts: [{ partId: 10, index: 0, name: 'Intro', range: { start: 0, end: 8 }, stepIds: [1, 2] }],
  steps: [first, empty, loose],
  groups: [
    {
      part: { partId: 10, index: 0, name: 'Intro', range: { start: 0, end: 8 }, stepIds: [1, 2] },
      steps: [first, empty],
    },
    { part: null, steps: [loose] },
  ],
  stage: { widthMetres: 10, depthMetres: 6, artworkSvg: null },
  ownSpotId: 7,
  formations: new Map([
    [1, [dotOf(7, 0.2)]],
    [2, []],
    [3, [dotOf(7, 0.8)]],
  ]),
};

describe('scoreGroupsOf', () => {
  it('staggers the entrance over all rows when revealing', () => {
    const delays = scoreGroupsOf(model, true).flatMap((group) =>
      group.rows.map((row) => row.entranceDelay),
    );

    expect(delays).toEqual([entranceDelayOf(0), entranceDelayOf(1), entranceDelayOf(2)]);
  });

  it('plays no entrance without the reveal', () => {
    const delays = scoreGroupsOf(model, false).flatMap((group) =>
      group.rows.map((row) => row.entranceDelay),
    );

    expect(delays).toEqual([null, null, null]);
  });

  it('enters a formation from the last step that had one', () => {
    const [, looseGroup] = scoreGroupsOf(model, false);

    expect(looseGroup?.rows[0]?.dots[0]).toMatchObject({ x: 0.8, fromX: 0.2 });
  });

  it('anchors part groups only', () => {
    const anchors = scoreGroupsOf(model, false).map((group) => group.anchor !== undefined);

    expect(anchors).toEqual([true, false]);
  });
});

describe('scoreYouOf', () => {
  it('shows the opening formation and the own place', () => {
    const you = scoreYouOf(model, [{ spotId: 7, number: 4 }], null);

    expect(you).toMatchObject({ place: 4, practiseMeta: null });
    expect(you.dots.map((dot) => dot.x)).toEqual([0.2]);
  });
});
