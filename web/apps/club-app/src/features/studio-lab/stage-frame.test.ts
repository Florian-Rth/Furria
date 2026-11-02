import { describe, expect, it } from 'vitest';
import {
  fitFrame,
  gridLinesOf,
  metresOfDelta,
  pxOfStagePoint,
  snappedStagePoint,
  stagePointOfPx,
  zoomedFrame,
} from './stage-frame';

const stage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

describe('fitFrame', () => {
  it.each([
    [448, 448, { scale: 40, x: 24, y: 64 }],
    [1048, 368, { scale: 40, x: 324, y: 24 }],
  ])('fits the stage into %s × %s', (width, height, frame) => {
    expect(fitFrame(stage, width, height)).toEqual(frame);
  });
});

describe('pxOfStagePoint and stagePointOfPx', () => {
  const frame = { scale: 20, x: 10, y: 5 };

  it.each([
    [
      { rightMetres: 0, backMetres: 0 },
      { x: 110, y: 165 },
    ],
    [
      { rightMetres: -5, backMetres: 8 },
      { x: 10, y: 5 },
    ],
    [
      { rightMetres: 2.5, backMetres: 1 },
      { x: 160, y: 145 },
    ],
  ])('maps %j to %j seen from the audience', (point, px) => {
    expect(pxOfStagePoint(point, stage, frame)).toEqual(px);
    expect(stagePointOfPx(px, stage, frame)).toEqual(point);
  });
});

describe('metresOfDelta', () => {
  it('turns a finger move into metres, up is backstage', () => {
    expect(metresOfDelta({ x: 30, y: -15 }, { scale: 30, x: 0, y: 0 })).toEqual({
      rightMetres: 1,
      backMetres: 0.5,
    });
  });
});

describe('zoomedFrame', () => {
  const fit = { scale: 20, x: 0, y: 0 };

  it.each([
    [2, { scale: 40, x: -100, y: -50 }],
    [0.5, { scale: 20, x: 0, y: 0 }],
    [100, { scale: 120, x: -500, y: -250 }],
  ])('zooms by %s around the fingers', (ratio, frame) => {
    expect(zoomedFrame(fit, fit, ratio, { x: 100, y: 50 }, 0, 0)).toEqual(frame);
  });

  it('pans with two fingers', () => {
    expect(zoomedFrame(fit, fit, 1, { x: 0, y: 0 }, 12, -8)).toEqual({ scale: 20, x: 12, y: -8 });
  });
});

describe('snappedStagePoint', () => {
  const frame = { scale: 200, x: 0, y: 0 };

  it.each([
    [
      { rightMetres: 1.27, backMetres: 3.6 },
      true,
      { rightMetres: 1.25, backMetres: 3.6 },
      1.25,
      null,
    ],
    [
      { rightMetres: 1.27, backMetres: 3.74 },
      true,
      { rightMetres: 1.25, backMetres: 3.75 },
      1.25,
      3.75,
    ],
    [
      { rightMetres: 1.27, backMetres: 3.6 },
      false,
      { rightMetres: 1.27, backMetres: 3.6 },
      null,
      null,
    ],
    [{ rightMetres: 9, backMetres: -2 }, false, { rightMetres: 5, backMetres: 0 }, null, null],
  ])('snaps %j (snapping %s)', (point, snapping, snapped, snapRight, snapBack) => {
    expect(snappedStagePoint(point, stage, frame, snapping)).toEqual({
      point: snapped,
      snapRight,
      snapBack,
    });
  });
});

describe('gridLinesOf', () => {
  it.each([
    [20, 11, 0],
    [60, 41, 30],
  ])('at %s px per metre draws %s columns, %s of them quarters', (scale, columns, quarters) => {
    const grid = gridLinesOf(stage, { scale, x: 0, y: 0 });

    expect(grid.columns).toHaveLength(columns);
    expect(grid.columns.filter((line) => line.kind === 'quarter')).toHaveLength(quarters);
    expect(grid.columns.filter((line) => line.kind === 'centre').map((line) => line.at)).toEqual([
      5 * scale,
    ]);
  });
});
