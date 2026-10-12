import { describe, expect, it } from 'vitest';
import type { KkCrop } from '../../image-crop';
import type { StageFrame, StageTransform } from './stage-geometry';
import { clampTransform, cropOf, rubberBand, transformOfCrop, zoomAbout } from './stage-geometry';

const LANDSCAPE_AS_PORTRAIT: StageFrame = {
  stage: { width: 400, height: 500 },
  image: { width: 4000, height: 3000 },
  fit: 'cover',
};

const expectCrop = (actual: KkCrop, expected: KkCrop): void => {
  expect(actual.left).toBeCloseTo(expected.left);
  expect(actual.top).toBeCloseTo(expected.top);
  expect(actual.width).toBeCloseTo(expected.width);
  expect(actual.height).toBeCloseTo(expected.height);
};

const expectTransform = (actual: StageTransform, expected: StageTransform): void => {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.zoom).toBeCloseTo(expected.zoom);
};

describe('cropOf', () => {
  it.each([
    {
      label: 'a landscape photo as a portrait',
      frame: LANDSCAPE_AS_PORTRAIT,
      expected: { left: 0.2, top: 0, width: 0.6, height: 1 },
    },
    {
      label: 'an upright photo as a group picture',
      frame: {
        stage: { width: 600, height: 400 },
        image: { width: 3000, height: 4000 },
        fit: 'cover' as const,
      },
      expected: { left: 0, top: 0.25, width: 1, height: 0.5 },
    },
  ])('frames the largest centred cut of $label at rest', ({ frame, expected }) => {
    expectCrop(cropOf({ x: 0, y: 0, zoom: 1 }, frame), expected);
  });

  it('halves the cut around its centre when zoomed in twice', () => {
    expectCrop(cropOf({ x: 0, y: 0, zoom: 2 }, LANDSCAPE_AS_PORTRAIT), {
      left: 0.35,
      top: 0.25,
      width: 0.3,
      height: 0.5,
    });
  });

  it('moves the cut against the image, as if the photo were pulled under the frame', () => {
    expectCrop(cropOf({ x: 100, y: -125, zoom: 2 }, LANDSCAPE_AS_PORTRAIT), {
      left: 0.275,
      top: 0.375,
      width: 0.3,
      height: 0.5,
    });
  });
});

describe('clampTransform', () => {
  it.each([
    { label: 'past the left edge', transform: { x: 10_000, y: 0, zoom: 2 }, left: 0, top: 0.25 },
    {
      label: 'past the bottom edge',
      transform: { x: 0, y: -10_000, zoom: 2 },
      left: 0.35,
      top: 0.5,
    },
    {
      label: 'beyond the deepest zoom',
      transform: { x: 0, y: 0, zoom: 9 },
      left: 0.425,
      top: 0.375,
    },
  ])('keeps a covering cut inside the photo $label', ({ transform, left, top }) => {
    const crop = cropOf(clampTransform(transform, LANDSCAPE_AS_PORTRAIT, 4), LANDSCAPE_AS_PORTRAIT);

    expect(crop.left).toBeCloseTo(left);
    expect(crop.top).toBeCloseTo(top);
  });

  it.each([
    { x: 9999, y: 9999, zoom: 1 },
    { x: -9999, y: 9999, zoom: 0.2 },
    { x: -140, y: -9999, zoom: 3.3 },
  ])('never shows empty space around a covering photo at %o', (transform) => {
    const crop = cropOf(clampTransform(transform, LANDSCAPE_AS_PORTRAIT, 4), LANDSCAPE_AS_PORTRAIT);

    expect(crop.left).toBeGreaterThanOrEqual(-1e-9);
    expect(crop.top).toBeGreaterThanOrEqual(-1e-9);
    expect(crop.left + crop.width).toBeLessThanOrEqual(1 + 1e-9);
    expect(crop.top + crop.height).toBeLessThanOrEqual(1 + 1e-9);
  });

  it.each([
    {
      label: 'centres both axes when the contained photo fits the stage',
      transform: { x: 50, y: 20, zoom: 1 },
      expected: { x: 0, y: 0, zoom: 1 },
    },
    {
      label: 'centres the narrow axis and pans the tall one when zoomed',
      transform: { x: 50, y: 500, zoom: 2 },
      expected: { x: 0, y: 150, zoom: 2 },
    },
  ])('$label', ({ transform, expected }) => {
    const upright: StageFrame = {
      stage: { width: 400, height: 300 },
      image: { width: 1000, height: 2000 },
      fit: 'contain',
    };

    expectTransform(clampTransform(transform, upright, 4), expected);
  });
});

describe('rubberBand', () => {
  it('stays put without overshoot', () => {
    expect(rubberBand(0, 400)).toBe(0);
  });

  it('grows with the overshoot but never reaches the stage size', () => {
    const bands = [10, 100, 1000, 1_000_000].map((overshoot) => ({
      overshoot,
      reach: rubberBand(overshoot, 400),
    }));
    const reaches = bands.map((band) => band.reach);

    expect(reaches).toEqual([...reaches].sort((a, b) => a - b));
    expect(new Set(reaches).size).toBe(reaches.length);
    expect(bands.every((band) => band.reach > 0 && band.reach < 400)).toBe(true);
    expect(bands.every((band) => band.reach < band.overshoot)).toBe(true);
  });

  it('follows the direction of the overshoot', () => {
    expect(rubberBand(-100, 400)).toBeCloseTo(-rubberBand(100, 400));
  });
});

describe('zoomAbout', () => {
  it.each([
    { transform: { x: 0, y: 0, zoom: 1 }, zoom: 3, focal: { x: 120, y: -40 } },
    { transform: { x: -80, y: 30, zoom: 2.5 }, zoom: 1, focal: { x: -60, y: 90 } },
  ])('keeps the photo point under the focal point fixed', ({ transform, zoom, focal }) => {
    const zoomed = zoomAbout(transform, zoom, focal);
    const pointBefore = {
      x: (focal.x - transform.x) / transform.zoom,
      y: (focal.y - transform.y) / transform.zoom,
    };
    const pointAfter = {
      x: (focal.x - zoomed.x) / zoomed.zoom,
      y: (focal.y - zoomed.y) / zoomed.zoom,
    };

    expect(pointAfter.x).toBeCloseTo(pointBefore.x);
    expect(pointAfter.y).toBeCloseTo(pointBefore.y);
    expect(zoomed.zoom).toBe(zoom);
  });
});

describe('transformOfCrop', () => {
  it.each([
    { left: 0.1, top: 0.2, width: 0.3, height: 0.5 },
    { left: 0.2, top: 0, width: 0.6, height: 1 },
    { left: 0.45, top: 0.6, width: 0.15, height: 0.25 },
  ])('returns to the cut it was made from: %o', (chosen) => {
    expectCrop(
      cropOf(transformOfCrop(chosen, LANDSCAPE_AS_PORTRAIT), LANDSCAPE_AS_PORTRAIT),
      chosen,
    );
  });

  it('keeps the cut when the stage is resized', () => {
    const chosen = { left: 0.1, top: 0.2, width: 0.3, height: 0.5 };
    const wider: StageFrame = { ...LANDSCAPE_AS_PORTRAIT, stage: { width: 960, height: 1200 } };

    expectCrop(cropOf(transformOfCrop(chosen, wider), wider), chosen);
  });
});
