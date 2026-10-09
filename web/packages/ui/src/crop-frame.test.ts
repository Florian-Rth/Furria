import { describe, expect, it } from 'vitest';
import type { KkCrop, KkCropImage, KkCropView } from './crop-frame';
import { panView, placeCropImage, resolveCrop, resolveView, zoomView } from './crop-frame';

const PORTRAIT = 4 / 5;
const GROUP_PICTURE = 3 / 2;
const LANDSCAPE_PHOTO: KkCropImage = { width: 4000, height: 3000 };
const UPRIGHT_PHOTO: KkCropImage = { width: 3000, height: 4000 };

const expectCrop = (actual: KkCrop, expected: KkCrop): void => {
  expect(actual.left).toBeCloseTo(expected.left);
  expect(actual.top).toBeCloseTo(expected.top);
  expect(actual.width).toBeCloseTo(expected.width);
  expect(actual.height).toBeCloseTo(expected.height);
};

describe('resolveCrop', () => {
  it.each([
    [
      'a landscape photo as a portrait',
      LANDSCAPE_PHOTO,
      PORTRAIT,
      { left: 0.2, top: 0, width: 0.6, height: 1 },
    ],
    [
      'an upright photo as a group picture',
      UPRIGHT_PHOTO,
      GROUP_PICTURE,
      { left: 0, top: 0.25, width: 1, height: 0.5 },
    ],
  ])('frames the largest centred cut of %s at the widest zoom', (_, image, aspect, expected) => {
    expectCrop(resolveCrop({ zoom: 1, centerX: 0.5, centerY: 0.5 }, image, aspect), expected);
  });

  it('halves the cut around its centre when zoomed in twice', () => {
    expectCrop(resolveCrop({ zoom: 2, centerX: 0.5, centerY: 0.5 }, LANDSCAPE_PHOTO, PORTRAIT), {
      left: 0.35,
      top: 0.25,
      width: 0.3,
      height: 0.5,
    });
  });

  it.each([
    ['past the left edge', { zoom: 2, centerX: 0, centerY: 0.5 }, 0, 0.25],
    ['past the bottom edge', { zoom: 2, centerX: 0.5, centerY: 1 }, 0.35, 0.5],
    ['beyond the deepest zoom', { zoom: 9, centerX: 0.5, centerY: 0.5 }, 0.425, 0.375],
  ])('keeps the cut inside the photo when the view reaches %s', (_, view, left, top) => {
    const crop = resolveCrop(view, LANDSCAPE_PHOTO, PORTRAIT);

    expect(crop.left).toBeCloseTo(left);
    expect(crop.top).toBeCloseTo(top);
  });
});

describe('resolveView', () => {
  it('starts centred and unzoomed when no cut was chosen yet', () => {
    expect(resolveView(null, LANDSCAPE_PHOTO, PORTRAIT)).toEqual({
      zoom: 1,
      centerX: 0.5,
      centerY: 0.5,
    });
  });

  it('returns to the cut it was made from', () => {
    const chosen: KkCrop = { left: 0.1, top: 0.2, width: 0.3, height: 0.5 };

    expectCrop(
      resolveCrop(resolveView(chosen, LANDSCAPE_PHOTO, PORTRAIT), LANDSCAPE_PHOTO, PORTRAIT),
      chosen,
    );
  });
});

describe('panView', () => {
  const zoomed: KkCropView = { zoom: 2, centerX: 0.5, centerY: 0.5 };

  it('moves the cut against the drag, as if the photo were pulled under the frame', () => {
    const view = panView(zoomed, LANDSCAPE_PHOTO, PORTRAIT, { x: 100, y: -125, frameWidth: 400 });

    expect(view.centerX).toBeCloseTo(0.5 - 0.25 * 0.3);
    expect(view.centerY).toBeCloseTo(0.5 + 0.25 * 0.5);
  });

  it('stops at the edge of the photo', () => {
    const view = panView(zoomed, LANDSCAPE_PHOTO, PORTRAIT, { x: 4000, y: 0, frameWidth: 400 });

    expect(view.centerX).toBeCloseTo(0.15);
  });
});

describe('zoomView', () => {
  it('pulls the centre back inside when zooming out near an edge', () => {
    const nearTheEdge: KkCropView = { zoom: 4, centerX: 0.9, centerY: 0.9 };

    const view = zoomView(nearTheEdge, LANDSCAPE_PHOTO, PORTRAIT, 1);

    expect(view.zoom).toBe(1);
    expect(view.centerX).toBeCloseTo(0.7);
    expect(view.centerY).toBeCloseTo(0.5);
  });
});

describe('placeCropImage', () => {
  it('scales and shifts the photo so the cut fills the frame', () => {
    expect(placeCropImage({ left: 0.25, top: 0.5, width: 0.5, height: 0.25 })).toEqual({
      left: '-50%',
      top: '-200%',
      width: '200%',
      height: '400%',
    });
  });
});
