import { describe, expect, it } from 'vitest';
import type { BroomSweepGeometry } from './broom-sweep-frame';
import {
  broomSweepFrameOf,
  clipAheadOf,
  clipBehindOf,
  durationOf,
  foldPoseOf,
  motePoseOf,
  ramp,
  sweepPathOf,
  wipeAt,
} from './broom-sweep-frame';
import type { BroomSweepPlan } from './broom-sweep-plan';

const geometry: BroomSweepGeometry = { textLeft: 46, markCenter: 22, span: 120, room: 260 };

const planOf = (overrides: Partial<BroomSweepPlan>): BroomSweepPlan => ({
  direction: 'forward',
  shift: 'fold',
  from: 'broom',
  ghost: { text: 'FURRIA', wordmark: true },
  ...overrides,
});

describe('ramp', () => {
  it.each([
    [0, 0.2, 0.6, 0],
    [0.4, 0.2, 0.6, 0.5],
    [0.9, 0.2, 0.6, 1],
  ])('maps %d between %d and %d to %d', (value, from, to, expected) => {
    expect(ramp(value, from, to)).toBeCloseTo(expected);
  });
});

describe('durationOf', () => {
  it.each([
    ['sweep', 1.05],
    ['fade', 0.22],
  ] as const)('plays %s for %d seconds', (mode, seconds) => {
    expect(durationOf(mode)).toBe(seconds);
  });
});

describe('foldPoseOf', () => {
  it('rests as the crossed brooms of the logo', () => {
    expect(foldPoseOf(0, 0)).toEqual({
      left: -122,
      right: 122,
      bristle: 1,
      reach: 1,
      thick: 1,
      shift: 0,
      ink: 0,
    });
  });

  it('folds into a chevron with the bristles gone', () => {
    const pose = foldPoseOf(1, 1);

    expect([pose.left, pose.right, pose.bristle, pose.ink]).toEqual([-225, 45, 0, 1]);
  });
});

describe('sweepPathOf', () => {
  it.each([
    [planOf({ shift: 'fold' }), { from: -24, to: 134, far: 134 }],
    [planOf({ shift: 'flick' }), { from: -12, to: 134, far: 134 }],
    [planOf({ direction: 'backward', shift: 'unfold' }), { from: 134, to: -24, far: 134 }],
    [planOf({ direction: 'backward', shift: 'flick' }), { from: 134, to: -12, far: 134 }],
  ])('runs the broom from mark or edge across the line', (plan, path) => {
    expect(sweepPathOf(plan, geometry)).toEqual(path);
  });
});

describe('wipeAt', () => {
  it.each([
    [0, -12],
    [1, 134],
  ])('puts the bristles at %d of the sweep', (p, wipe) => {
    expect(wipeAt(p, { from: -12, to: 134, far: 134 })).toBeCloseTo(wipe);
  });
});

describe('clips', () => {
  it.each([
    ['forward', 'inset(-40% -200% -40% 30px)', 'inset(-40% calc(100% - 30px) -40% -12px)'],
    ['backward', 'inset(-40% calc(100% - 30px) -40% -12px)', 'inset(-40% -200% -40% 30px)'],
  ] as const)(
    'wipes the old line behind and reveals the new ahead going %s',
    (direction, behind, ahead) => {
      const plan = planOf({ direction });

      expect([clipBehindOf(30, plan), clipAheadOf(30, plan)]).toEqual([behind, ahead]);
    },
  );
});

describe('motePoseOf', () => {
  it.each([
    [0, 0],
    [1, 0],
  ])('keeps dust unseen before its birth and after its life at %d', (p, opacity) => {
    expect(motePoseOf(4, p, planOf({}), geometry).opacity).toBe(opacity);
  });

  it('throws dust in the sweep direction', () => {
    const forward = motePoseOf(4, 0.5, planOf({}), geometry);
    const backward = motePoseOf(
      4,
      0.5,
      planOf({ direction: 'backward', shift: 'flick' }),
      geometry,
    );
    const forwardBirth = motePoseOf(4, 0.3, planOf({}), geometry);

    expect([
      forward.x > forwardBirth.x,
      backward.x <
        motePoseOf(4, 0.3, planOf({ direction: 'backward', shift: 'flick' }), geometry).x,
    ]).toEqual([true, true]);
  });
});

describe('broomSweepFrameOf', () => {
  it('hides the new line and shows the logo before the sweep starts', () => {
    const frame = broomSweepFrameOf(0, planOf({}), geometry, 'sweep');

    expect([
      frame['--kk-bs-reveal'],
      frame['--kk-bs-mark-opacity'],
      frame['--kk-bs-fold-brand-opacity'],
    ]).toEqual(['inset(-40% calc(100% - -24px) -40% -12px)', '0', '1']);
  });

  it('hands the mark back to the real arrow once folded', () => {
    const frame = broomSweepFrameOf(1, planOf({}), geometry, 'sweep');

    expect([frame['--kk-bs-mark-opacity'], frame['--kk-bs-fold-ink-opacity']]).toEqual(['1', '0']);
  });

  it('crossfades without a broom under reduced motion', () => {
    const frame = broomSweepFrameOf(0.25, planOf({}), geometry, 'fade');

    expect([
      frame['--kk-bs-sweeper-opacity'],
      frame['--kk-bs-reveal-opacity'],
      frame['--kk-bs-ghost-opacity'],
      frame['--kk-bs-mark-opacity'],
    ]).toEqual(['0', '0.25', '0.75', '0.25']);
  });

  it('keeps the mark while crossfading an unchanged glyph', () => {
    const frame = broomSweepFrameOf(0.5, planOf({ shift: 'flick' }), geometry, 'fade');

    expect([frame['--kk-bs-mark-opacity'], frame['--kk-bs-ghost-glyph-opacity']]).toEqual([
      '1',
      '0',
    ]);
  });
});
