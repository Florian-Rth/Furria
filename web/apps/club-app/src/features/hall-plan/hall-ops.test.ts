import { describe, expect, it } from 'vitest';
import {
  createArea,
  duplicateElements,
  elementBounds,
  elementsInBounds,
  hitTestHall,
  hitTestVertex,
  moveElements,
  moveVertex,
  rotateElements,
} from './hall-ops';
import type { HallDocument, HallElement } from './schemas';

const wall: HallElement = {
  id: 'e1',
  kind: 'wall',
  points: [
    { x: 0, y: 0 },
    { x: 1000, y: 0 },
  ],
  thicknessCm: 20,
};
const stage: HallElement = {
  id: 'e2',
  kind: 'area',
  area: 'stage',
  x: 500,
  y: 200,
  widthCm: 400,
  heightCm: 200,
  rotation: 0,
  label: null,
};
const door: HallElement = {
  id: 'e3',
  kind: 'door',
  from: { x: 100, y: 0 },
  to: { x: 200, y: 0 },
  door: 'entrance',
};
const hall: HallDocument = { elements: [wall, stage, door] };

describe('createArea', () => {
  it('centres an area between two dragged corners and keeps a minimum size', () => {
    expect(createArea('e9', 'bar', { x: 300, y: 100 }, { x: 100, y: 105 })).toMatchObject({
      x: 200,
      y: 102.5,
      widthCm: 200,
      heightCm: 10,
    });
  });
});

describe('moveElements', () => {
  it('moves points and centres of the chosen elements only', () => {
    const moved = moveElements(hall, ['e1', 'e2'], { x: 10, y: 5 });

    expect(moved.elements[0]).toMatchObject({
      points: [
        { x: 10, y: 5 },
        { x: 1010, y: 5 },
      ],
    });
    expect(moved.elements[1]).toMatchObject({ x: 510, y: 205 });
    expect(moved.elements[2]).toBe(door);
  });
});

describe('moveVertex', () => {
  it.each([
    [
      'a wall point',
      'e1',
      1,
      {
        points: [
          { x: 0, y: 0 },
          { x: 900, y: 50 },
        ],
      },
    ],
    ['a door end', 'e3', 0, { from: { x: 900, y: 50 } }],
  ])('moves %s', (_name, id, index, expected) => {
    const moved = moveVertex(hall, id, index, { x: 900, y: 50 });

    expect(moved.elements.find((element) => element.id === id)).toMatchObject(expected);
  });

  it('ignores vertices that do not exist', () => {
    expect(moveVertex(hall, 'e2', 0, { x: 0, y: 0 })).toBe(hall);
  });
});

describe('rotateElements', () => {
  it('turns an area about the selection centre and adds to its rotation', () => {
    const rotated = rotateElements(hall, ['e2'], 90);

    expect(rotated.elements[1]).toMatchObject({ x: 500, y: 200, rotation: 90 });
  });
});

describe('duplicateElements', () => {
  it('copies with fresh ids and an offset', () => {
    const { document, ids } = duplicateElements(hall, ['e2'], { x: 50, y: 50 });

    expect(ids).toEqual(['e4']);
    expect(document.elements.at(-1)).toMatchObject({ id: 'e4', x: 550, y: 250 });
  });
});

describe('hitTestHall', () => {
  it.each([
    ['the door over the wall', { x: 150, y: 3 }, 'e3'],
    ['the wall by its thickness', { x: 600, y: 12 }, 'e1'],
    ['the stage', { x: 500, y: 250 }, 'e2'],
    ['nothing', { x: 2000, y: 2000 }, null],
  ])('hits %s', (_name, at, expected) => {
    expect(hitTestHall(hall, at, 5)).toBe(expected);
  });
});

describe('hitTestVertex', () => {
  it('finds a vertex of a selected element only', () => {
    expect(hitTestVertex(hall, ['e1'], { x: 998, y: 2 }, 5)).toEqual({
      elementId: 'e1',
      vertexIndex: 1,
    });
    expect(hitTestVertex(hall, ['e2'], { x: 998, y: 2 }, 5)).toBeNull();
  });
});

describe('elementBounds / elementsInBounds', () => {
  it('widens a wall by half its thickness', () => {
    expect(elementBounds(wall)).toEqual({ minX: -10, minY: -10, maxX: 1010, maxY: 10 });
  });

  it('selects the elements lying fully inside a marquee', () => {
    expect(elementsInBounds(hall, { minX: 50, minY: -50, maxX: 800, maxY: 400 })).toEqual([
      'e2',
      'e3',
    ]);
  });
});
