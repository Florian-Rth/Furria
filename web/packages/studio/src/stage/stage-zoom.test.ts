import { describe, expect, it } from 'vitest';
import { shareOfAreaPoint, stageZoomOf, zoomedStageViewOf } from './stage-zoom';

const whole = {
  frame: { left: 0, top: 0, width: 1, height: 1 },
  plane: { left: 20, top: 10, width: 200, height: 100 },
};

describe('zoomedStageViewOf', () => {
  it('keeps the stage point under the fingers while zooming in', () => {
    const focal = { x: 70, y: 35 };
    const zoomed = zoomedStageViewOf(whole, focal, 2, { x: 0, y: 0 });

    expect(zoomed.frame).toEqual({ left: 0.125, top: 0.125, width: 0.5, height: 0.5 });
    expect(shareOfAreaPoint(focal, zoomed.plane)).toEqual(shareOfAreaPoint(focal, whole.plane));
  });

  it('moves the stage with a two-finger pan', () => {
    const zoomed = zoomedStageViewOf(whole, { x: 120, y: 60 }, 2, { x: 0, y: 0 });
    const panned = zoomedStageViewOf(zoomed, { x: 120, y: 60 }, 1, { x: -40, y: 0 });

    expect(panned.frame).toEqual({ left: 0.35, top: 0.25, width: 0.5, height: 0.5 });
    expect(panned.plane.left).toBe(zoomed.plane.left - 40);
  });

  it('keeps the stage point under the moving fingers while zooming and panning at once', () => {
    const before = { x: 70, y: 35 };
    const after = { x: 90, y: 45 };
    const zoomed = zoomedStageViewOf(whole, after, 2, { x: 20, y: 10 });

    expect(shareOfAreaPoint(after, zoomed.plane)).toEqual(shareOfAreaPoint(before, whole.plane));
  });

  it('stops the pan at the stage edge', () => {
    const zoomed = zoomedStageViewOf(whole, { x: 120, y: 60 }, 2, { x: 0, y: 0 });
    const panned = zoomedStageViewOf(zoomed, { x: 120, y: 60 }, 1, { x: 1000, y: 0 });

    expect(panned.frame.left).toBe(0);
  });

  it.each([
    ['never zooms out past the whole stage', 0.25, 1],
    ['never zooms in past six times', 100, 6],
  ])('%s', (_, ratio, zoom) => {
    expect(
      stageZoomOf(zoomedStageViewOf(whole, { x: 120, y: 60 }, ratio, { x: 0, y: 0 }).frame),
    ).toBe(zoom);
  });

  it('returns to the whole stage and its plane once zoomed fully out', () => {
    const zoomed = zoomedStageViewOf(whole, { x: 60, y: 30 }, 3, { x: 0, y: 0 });

    const back = zoomedStageViewOf(zoomed, { x: 200, y: 90 }, 1 / 3, { x: 0, y: 0 });

    expect(back.frame).toEqual(whole.frame);
    expect(back.plane.left).toBeCloseTo(whole.plane.left);
    expect(back.plane.top).toBeCloseTo(whole.plane.top);
    expect(back.plane.width).toBeCloseTo(whole.plane.width);
  });
});
