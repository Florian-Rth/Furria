import { describe, expect, it } from 'vitest';
import type { TuschGeometry, TuschPlan } from './tusch-score';
import {
  buzzPatternOf,
  contactOf,
  crossingOf,
  liftAt,
  planStrike,
  ringAt,
  strikeDurationOf,
  strikeFrameAt,
} from './tusch-score';

const geometry: TuschGeometry = {
  headline: { left: 20, top: 80, width: 350, height: 36, glyph: 32 },
  slot: { left: 50, top: 30, height: 20, glyph: 16 },
  copyGlyph: 32,
};

const impactPlan: TuschPlan = {
  from: { x: 20, y: 100, scale: 1.06 },
  to: { x: 50, y: 32, scale: 0.5 },
  shadowX: 2,
  shadowY: 10,
  strike: 'impact',
  fadesIn: false,
};

const quietPlan: TuschPlan = { ...impactPlan, strike: 'quiet' };

describe('liftAt', () => {
  it.each([
    { scrollOffset: -10, hold: 0, scale: 1, leaveOpacity: 1 },
    { scrollOffset: 0, hold: 0, scale: 1, leaveOpacity: 1 },
    { scrollOffset: 7.2, hold: 7.2, scale: 1.0216, leaveOpacity: 0.5 },
    { scrollOffset: 36, hold: 36, scale: 1.06, leaveOpacity: 0 },
    { scrollOffset: 200, hold: 36, scale: 1.06, leaveOpacity: 0 },
  ])(
    'holds and lifts the headline at $scrollOffset px',
    ({ scrollOffset, hold, scale, leaveOpacity }) => {
      const lift = liftAt(scrollOffset);

      expect(lift.hold).toBeCloseTo(hold);
      expect(lift.scale).toBeCloseTo(scale);
      expect(lift.leaveOpacity).toBeCloseTo(leaveOpacity);
    },
  );

  it.each([
    { scrollOffset: 0, shadowY: 0 },
    { scrollOffset: 18, shadowY: 7.5 },
    { scrollOffset: 36, shadowY: 10 },
  ])('deepens the shadow to $shadowY at $scrollOffset px', ({ scrollOffset, shadowY }) => {
    expect(liftAt(scrollOffset).shadowY).toBeCloseTo(shadowY);
  });
});

describe('crossingOf', () => {
  it.each([
    { previous: 10, next: 36, crossing: 'down' },
    { previous: 0, next: 400, crossing: 'down' },
    { previous: 36, next: 35, crossing: 'up' },
    { previous: 400, next: 0, crossing: 'up' },
    { previous: 10, next: 30, crossing: null },
    { previous: 50, next: 80, crossing: null },
  ])('from $previous to $next is $crossing', ({ previous, next, crossing }) => {
    expect(crossingOf(previous, next)).toBe(crossing);
  });
});

describe('planStrike', () => {
  it('starts from the held, lifted headline and lands on the bar slot', () => {
    const plan = planStrike(geometry, 36, 'impact');

    expect(plan.from.x).toBe(20);
    expect(plan.from.y).toBeCloseTo(78.92);
    expect(plan.from.scale).toBeCloseTo(1.06);
    expect(plan.to.x).toBe(50);
    expect(plan.to.y).toBeCloseTo(31.2);
    expect(plan.to.scale).toBeCloseTo(0.5);
    expect(plan.fadesIn).toBe(false);
  });

  it('follows the page once the scroll overshoots the threshold', () => {
    expect(planStrike(geometry, 60, 'impact').from.y).toBeCloseTo(54.92);
  });

  it('drops a larger copy of the title onto the slot without a headline', () => {
    const plan = planStrike({ ...geometry, headline: null }, 36, 'quiet');

    expect(plan.from.scale).toBeCloseTo(0.85);
    expect(plan.from.y).toBe(plan.to.y);
    expect(plan.fadesIn).toBe(true);
  });
});

describe('strikeFrameAt', () => {
  it.each([
    { plan: impactPlan, time: 0, copy: 1, title: 0 },
    { plan: impactPlan, time: 0.2, copy: 1, title: 0 },
    { plan: impactPlan, time: 0.285, copy: 0, title: 1 },
    { plan: quietPlan, time: 0.19, copy: 1, title: 0 },
    { plan: quietPlan, time: 0.2, copy: 0, title: 1 },
  ])(
    'hands the title from copy to bar at contact ($plan.strike, $time s)',
    ({ plan, time, copy, title }) => {
      const frame = strikeFrameAt(time, plan);

      expect([frame.copyOpacity, frame.titleOpacity]).toEqual([copy, title]);
    },
  );

  it('rises before it slams', () => {
    const frame = strikeFrameAt(0.09, impactPlan);

    expect(frame.copyY).toBeCloseTo(94);
    expect(frame.copyScale).toBeCloseTo(1.1024);
  });

  it('lands exactly on the slot', () => {
    const frame = strikeFrameAt(contactOf('impact'), impactPlan);

    expect(frame.copyX).toBeCloseTo(50);
    expect(frame.copyY).toBeCloseTo(32);
    expect(frame.copyScale).toBeCloseTo(0.5);
  });

  it.each([
    { time: 0.27, ink: 0, flash: 0 },
    { time: 0.285, ink: 2, flash: 1 },
    { time: 0.33, ink: 2, flash: 1 - (0.05 / 0.42) ** 2 },
    { time: 0.55, ink: 0, flash: 1 - (0.27 / 0.42) ** 2 },
  ])('prints ink offset $ink and flash $flash at $time s', ({ time, ink, flash }) => {
    const frame = strikeFrameAt(time, impactPlan);

    expect(frame.inkOffset).toBeCloseTo(ink);
    expect(frame.flashOpacity).toBeCloseTo(flash);
  });

  it.each([0.3, 0.45, 0.8])('keeps the quiet strike free of ink and ring at %f s', (time) => {
    const frame = strikeFrameAt(time, quietPlan);

    expect([frame.inkOpacity, frame.flashOpacity, frame.glow, frame.chromeScale]).toEqual([
      0, 0, 0, 1,
    ]);
  });

  it.each([
    { plan: impactPlan, time: 0.28, restOpacity: 1, restRotate: 0 },
    { plan: impactPlan, time: 0.6, restOpacity: 0, restRotate: 10 },
    { plan: quietPlan, time: 0.36, restOpacity: 0, restRotate: 0 },
  ])(
    'knocks the old bar text away ($plan.strike, $time s)',
    ({ plan, time, restOpacity, restRotate }) => {
      const frame = strikeFrameAt(time, plan);

      expect(frame.restOpacity).toBeCloseTo(restOpacity);
      expect(frame.restRotate).toBeCloseTo(restRotate);
    },
  );

  it.each([
    { since: 0, scale: 1 },
    { since: 0.05, scale: 0.982 },
    { since: 0.15, scale: 1.014 },
  ])('dips then rings the glass $since s after contact', ({ since, scale }) => {
    expect(strikeFrameAt(0.28 + since, impactPlan).chromeScale).toBeCloseTo(scale);
  });

  it('fades a synthetic copy in', () => {
    expect(strikeFrameAt(0.05, { ...quietPlan, fadesIn: true }).copyOpacity).toBeCloseTo(0.5);
  });
});

describe('ringAt', () => {
  it.each([
    { since: 0, glow: 0 },
    { since: 0.15, glow: 1 },
    { since: 0.27, glow: 0 },
    { since: 0.32, glow: 0.58 },
    { since: 0.49, glow: 0.32 },
    { since: 0.7, glow: 0 },
  ])('rings $glow at $since s', ({ since, glow }) => {
    expect(ringAt(since)).toBeCloseTo(glow, 1);
  });
});

describe('strikeDurationOf', () => {
  it.each([
    { strike: 'impact', seconds: 0.9 },
    { strike: 'quiet', seconds: 0.42 },
  ] as const)('lasts $seconds s for $strike', ({ strike, seconds }) => {
    expect(strikeDurationOf(strike)).toBeCloseTo(seconds);
  });
});

describe('buzzPatternOf', () => {
  it('buzzes on contact and on every beat', () => {
    expect(buzzPatternOf(0.28)).toEqual([0, 280, 22, 128, 14, 156, 11, 159, 8]);
  });
});
