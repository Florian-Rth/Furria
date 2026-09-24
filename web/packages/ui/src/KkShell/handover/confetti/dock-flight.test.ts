import { describe, expect, it } from 'vitest';
import type { DockBox } from './dock-flight';
import { dockFlightAt, dockProgressAt, dockStageAt, landingDue } from './dock-flight';

const headline: DockBox = { left: 20, top: 76, width: 350, height: 44, glyph: 40 };
const slot: DockBox = { left: 49, top: 26, width: 300, height: 24, glyph: 20 };

describe('dockProgressAt', () => {
  it.each([
    { scrollOffset: -20, progress: 0 },
    { scrollOffset: 0, progress: 0 },
    { scrollOffset: 30, progress: 0.5 },
    { scrollOffset: 60, progress: 1 },
    { scrollOffset: 400, progress: 1 },
  ])('maps $scrollOffset px to progress $progress', ({ scrollOffset, progress }) => {
    expect(dockProgressAt(scrollOffset, 60)).toBe(progress);
  });
});

describe('dockStageAt', () => {
  it.each([
    { progress: 0, docking: true, realHeadline: 1, flight: 0, title: 0 },
    { progress: 0.4, docking: true, realHeadline: 0, flight: 1, title: 0 },
    { progress: 1, docking: true, realHeadline: 0, flight: 0, title: 1 },
    { progress: 0.4, docking: false, realHeadline: 0, flight: 0, title: 0 },
    { progress: 1, docking: false, realHeadline: 0, flight: 0, title: 1 },
  ])(
    'at $progress (docking $docking) hands the title to headline $realHeadline, flight $flight, bar $title',
    ({ progress, docking, realHeadline, flight, title }) => {
      const stage = dockStageAt(progress, docking, 14);

      expect([stage.realHeadlineOpacity, stage.flightOpacity, stage.titleOpacity]).toEqual([
        realHeadline,
        flight,
        title,
      ]);
    },
  );

  it.each([
    { progress: 0, restOpacity: 1, headerDrift: -0 },
    { progress: 0.25, restOpacity: 5 / 6, headerDrift: -7 },
    { progress: 0.5, restOpacity: 0, headerDrift: -14 },
  ])(
    'shoves the rest text and lifts the header at $progress',
    ({ progress, restOpacity, headerDrift }) => {
      const stage = dockStageAt(progress, true, 14);

      expect(stage.restOpacity).toBeCloseTo(restOpacity);
      expect(stage.headerDrift).toBeCloseTo(headerDrift);
    },
  );
});

describe('dockFlightAt', () => {
  it.each([
    { scrollOffset: 0, x: 0, y: 0, scale: 1 },
    { scrollOffset: 60, x: 29, y: -49, scale: 0.5 },
    { scrollOffset: 30, x: 18.85, y: -30.35, scale: 0.675 },
  ])('places the flying headline at $scrollOffset px', ({ scrollOffset, x, y, scale }) => {
    const placement = dockFlightAt(scrollOffset, headline, slot, 60);

    expect(placement.x).toBeCloseTo(x);
    expect(placement.y).toBeCloseTo(y);
    expect(placement.scale).toBeCloseTo(scale);
  });
});

describe('landingDue', () => {
  it.each([
    { previous: 0.9, next: 1, landed: false, due: true },
    { previous: 0.2, next: 1, landed: false, due: true },
    { previous: 0.9, next: 1, landed: true, due: false },
    { previous: 1, next: 1, landed: false, due: false },
    { previous: 1, next: 0.8, landed: false, due: false },
    { previous: 0.5, next: 0.99, landed: false, due: false },
  ])('from $previous to $next (landed $landed) is due: $due', ({ previous, next, landed, due }) => {
    expect(landingDue(previous, next, landed)).toBe(due);
  });
});
