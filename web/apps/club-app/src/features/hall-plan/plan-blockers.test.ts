import { describe, expect, it } from 'vitest';
import { blockersOf, triangulate } from './plan-blockers';
import type { HallDocument, SeatingStandard } from './schemas';

const standard: SeatingStandard = {
  comfortableChairSpacingCm: 60,
  maximumChairSpacingCm: 45,
  chairDepthCm: 50,
  aisleWidthCm: 120,
  exitClearanceCm: 120,
};

const area = (x: number, y: number) => ({ x, y });

describe('triangulate', () => {
  it.each([
    ['a square', [area(0, 0), area(100, 0), area(100, 100), area(0, 100)], 2],
    [
      'an L shape',
      [area(0, 0), area(200, 0), area(200, 100), area(100, 100), area(100, 200), area(0, 200)],
      4,
    ],
  ])('splits %s into triangles covering its area', (_name, outline, count) => {
    const triangles = triangulate(outline);
    const areaOf = (points: readonly { x: number; y: number }[]) =>
      Math.abs(
        points.reduce((sum, point, index) => {
          const next = points[(index + 1) % points.length] ?? point;

          return sum + point.x * next.y - next.x * point.y;
        }, 0) / 2,
      );

    expect(triangles).toHaveLength(count);
    expect(triangles.reduce((sum, triangle) => sum + areaOf(triangle), 0)).toBeCloseTo(
      areaOf(outline),
    );
  });
});

describe('blockersOf', () => {
  it('blocks walls, areas, pillars and exit zones but not lines, texts or doors', () => {
    const hall: HallDocument = {
      elements: [
        {
          id: 'w',
          kind: 'wall',
          points: [area(0, 0), area(100, 0), area(100, 100)],
          thicknessCm: 20,
        },
        {
          id: 'a',
          kind: 'area',
          shape: 'polygon',
          area: 'stage',
          points: [
            area(0, 0),
            area(200, 0),
            area(200, 100),
            area(100, 100),
            area(100, 200),
            area(0, 200),
          ],
          label: null,
        },
        { id: 'p', kind: 'pillar', x: 0, y: 0, widthCm: 40, heightCm: 40, round: true },
        { id: 'x', kind: 'door', from: area(0, 0), to: area(100, 0), door: 'emergencyExit' },
        { id: 'd', kind: 'door', from: area(0, 0), to: area(100, 0), door: 'entrance' },
        { id: 'l', kind: 'line', points: [area(0, 0), area(10, 0)], label: null },
        { id: 't', kind: 'text', x: 0, y: 0, text: 'Bar', size: 'small', rotation: 0 },
      ],
    };

    expect(blockersOf(hall, standard).map((blocker) => blocker.elementId)).toEqual([
      'w',
      'w',
      'a',
      'a',
      'a',
      'a',
      'p',
      'x',
    ]);
  });
});
