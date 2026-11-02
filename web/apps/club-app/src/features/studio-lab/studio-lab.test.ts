import { describe, expect, it } from 'vitest';
import type { MyAct } from '@/features/acts/schemas';
import { labActIdOf } from './studio-lab';

const actOf = (actId: number, playable: boolean, viewerLeads: boolean): MyAct => ({
  actId,
  name: `Auftritt ${actId}`,
  kind: null,
  sessionYear: 2027,
  group: null,
  viewerInCast: true,
  viewerLeads,
  playable,
  cast: [],
  editors: [],
  nextEvening: null,
  nextTraining: null,
});

describe('labActIdOf', () => {
  it.each([
    [[actOf(1, false, true), actOf(2, true, false), actOf(3, true, true)], undefined, 3],
    [[actOf(1, false, true), actOf(2, true, false)], undefined, 2],
    [[actOf(1, false, false)], undefined, 1],
    [[actOf(1, true, true)], 9, 9],
    [[], undefined, null],
  ])('picks from %j (asked %s)', (acts, requested, actId) => {
    expect(labActIdOf(acts, requested)).toBe(actId);
  });
});
