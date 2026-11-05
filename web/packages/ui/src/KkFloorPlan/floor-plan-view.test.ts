import { describe, expect, it } from 'vitest';
import {
  boundsOfPoints,
  clampPlanScale,
  fitPlanView,
  panPlanBy,
  pinchPlanView,
  planGridPath,
  planGridSteps,
  planToScreen,
  planViewBox,
  screenToPlan,
  wheelZoomFactor,
  zoomPlanAbout,
} from './floor-plan-view';

const size = { width: 800, height: 600 };

describe('screenToPlan / planToScreen', () => {
  it('maps the viewport centre to the view centre', () => {
    expect(
      screenToPlan({ centerX: 500, centerY: 300, scale: 2 }, size, { x: 400, y: 300 }),
    ).toEqual({ x: 500, y: 300 });
  });

  it('round-trips a point', () => {
    const view = { centerX: 120, centerY: -40, scale: 0.25 };
    const plan = screenToPlan(view, size, { x: 10, y: 590 });

    expect(planToScreen(view, size, plan)).toEqual({ x: 10, y: 590 });
  });
});

describe('zoomPlanAbout', () => {
  it('keeps the plan point under the pointer in place', () => {
    const view = { centerX: 0, centerY: 0, scale: 1 };
    const pointer = { x: 600, y: 100 };
    const before = screenToPlan(view, size, pointer);
    const zoomed = zoomPlanAbout(view, size, pointer, 2);

    expect(zoomed.scale).toBe(2);
    expect(screenToPlan(zoomed, size, pointer)).toEqual(before);
  });

  it('stops at the scale limits', () => {
    expect(
      zoomPlanAbout({ centerX: 0, centerY: 0, scale: 6 }, size, { x: 0, y: 0 }, 10).scale,
    ).toBe(8);
  });
});

describe('clampPlanScale', () => {
  it.each([
    [0.001, 0.02],
    [1, 1],
    [100, 8],
  ])('clamps %d to %d', (scale, expected) => {
    expect(clampPlanScale(scale)).toBe(expected);
  });
});

describe('panPlanBy', () => {
  it('moves the centre against the drag, in cm', () => {
    expect(panPlanBy({ centerX: 0, centerY: 0, scale: 0.5 }, 100, -50)).toEqual({
      centerX: -200,
      centerY: 100,
      scale: 0.5,
    });
  });
});

describe('fitPlanView', () => {
  it('centres the bounds and fits the tighter axis inside the padding', () => {
    expect(fitPlanView({ minX: 0, minY: 0, maxX: 2000, maxY: 1000 }, size, 0)).toEqual({
      centerX: 1000,
      centerY: 500,
      scale: 0.4,
    });
  });

  it('treats empty bounds as one centimetre', () => {
    expect(fitPlanView({ minX: 5, minY: 5, maxX: 5, maxY: 5 }, size, 0).scale).toBe(8);
  });
});

describe('planViewBox', () => {
  it('spans the viewport in cm around the centre', () => {
    expect(planViewBox({ centerX: 100, centerY: 50, scale: 2 }, size)).toEqual({
      x: -100,
      y: -100,
      width: 400,
      height: 300,
    });
  });
});

describe('planGridSteps', () => {
  it.each([
    [1, 10, 50],
    [0.1, 100, 500],
    [0.015, 1000, 5000],
    [0.001, 5000, 5000],
  ])('at scale %d draws %d cm minor and %d cm major lines', (scale, minorCm, majorCm) => {
    expect(planGridSteps(scale)).toEqual({ minorCm, majorCm });
  });
});

describe('planGridPath', () => {
  it('draws the lines inside the box and leaves out the major ones', () => {
    expect(planGridPath({ x: 0, y: 0, width: 100, height: 50 }, 50, 100)).toBe('M50 0V50M0 50H100');
  });

  it('draws every line without a skip step', () => {
    expect(planGridPath({ x: -10, y: 0, width: 20, height: 5 }, 10, null)).toBe(
      'M-10 0V5M0 0V5M10 0V5M-10 0H10',
    );
  });
});

describe('pinchPlanView', () => {
  it('zooms by the finger spread and follows the midpoint', () => {
    const start = {
      view: { centerX: 0, centerY: 0, scale: 1 },
      midpoint: { x: 400, y: 300 },
      distance: 100,
    };

    expect(pinchPlanView(start, size, { x: 420, y: 300 }, 200)).toEqual({
      centerX: -10,
      centerY: 0,
      scale: 2,
    });
  });
});

describe('wheelZoomFactor', () => {
  it.each([
    [0, 1],
    [-100, Math.exp(0.15)],
  ])('turns delta %d into factor %d', (delta, factor) => {
    expect(wheelZoomFactor(delta)).toBeCloseTo(factor);
  });
});

describe('boundsOfPoints', () => {
  it('returns null without points', () => {
    expect(boundsOfPoints([])).toBeNull();
  });

  it('spans every point', () => {
    expect(
      boundsOfPoints([
        { x: 3, y: -1 },
        { x: -2, y: 8 },
      ]),
    ).toEqual({
      minX: -2,
      minY: -1,
      maxX: 3,
      maxY: 8,
    });
  });
});
