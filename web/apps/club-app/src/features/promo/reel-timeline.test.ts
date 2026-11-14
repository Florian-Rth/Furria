import { describe, expect, it } from 'vitest';
import { reelPositionOf, reelQrPoseOf, reelScenesOf, reelSlotsOf } from './reel-timeline';

const FIRST = reelScenesOf(true);
const LATER = reelScenesOf(false);

describe('reelScenesOf', () => {
  it('opens only the first loop with the opener', () => {
    expect(FIRST.map((scene) => scene.key)[0]).toBe('opener');
    expect(LATER.map((scene) => scene.key)).not.toContain('opener');
  });

  it('never runs the same cut twice in a row, across the loop seam too', () => {
    const cuts = [...FIRST, ...LATER, ...LATER].map((scene) => scene.cut).slice(1);

    expect(cuts.every((cut, index) => index === 0 || cut !== cuts[index - 1])).toBe(true);
  });
});

describe('reelPositionOf', () => {
  it.each([
    { elapsed: 0, loop: 0, key: 'opener', sceneMs: 0 },
    { elapsed: 4500, loop: 0, key: 'start', sceneMs: 500 },
    { elapsed: 153999, loop: 0, key: 'finale', sceneMs: 9999 },
    { elapsed: 154000, loop: 1, key: 'start', sceneMs: 0 },
    { elapsed: 154000 + 150000 + 20100, loop: 2, key: 'calendar', sceneMs: 100 },
  ])('$elapsed ms is $sceneMs ms into $key of loop $loop', ({ elapsed, loop, key, sceneMs }) => {
    const position = reelPositionOf(elapsed, FIRST, LATER);
    const scenes = position.loop === 0 ? FIRST : LATER;

    expect({
      loop: position.loop,
      key: scenes[position.index]?.key,
      sceneMs: position.sceneMs,
    }).toEqual({
      loop,
      key,
      sceneMs,
    });
  });
});

describe('reelSlotsOf', () => {
  const slotsAt = (elapsed: number): string[] =>
    reelSlotsOf(reelPositionOf(elapsed, FIRST, LATER), FIRST, LATER).map(
      (slot) => `${slot.scene.key}:${slot.phase}:${slot.cut}`,
    );

  it('keeps the left scene for the cut, shows the current one and preloads the next', () => {
    expect(slotsAt(4200)).toEqual([
      'opener:leaving:mask',
      'start:live:mask',
      'calendar:waiting:match',
    ]);
  });

  it('drops the left scene once the cut is over', () => {
    expect(slotsAt(6000)).toEqual(['start:live:mask', 'calendar:waiting:match']);
  });

  it('preloads the first scene of the next loop during the finale and leaves the finale into it', () => {
    expect(slotsAt(150000)).toEqual(['finale:live:match', 'start:waiting:whip']);
    expect(slotsAt(154300)).toEqual([
      'finale:leaving:whip',
      'start:live:whip',
      'calendar:waiting:match',
    ]);
  });
});

describe('reelQrPoseOf', () => {
  it.each([
    { elapsed: 30000, pose: 'away' },
    { elapsed: 144000 + 9000, pose: 'hero' },
    { elapsed: 144000 + 9200, pose: 'corner' },
    { elapsed: 154000 + 5000, pose: 'corner' },
    { elapsed: 154000 + 140000 + 500, pose: 'hero' },
  ])('$elapsed ms shows the access code as $pose', ({ elapsed, pose }) => {
    expect(reelQrPoseOf(reelPositionOf(elapsed, FIRST, LATER), FIRST, LATER)).toBe(pose);
  });
});
