import { describe, expect, it } from 'vitest';
import type { HallDocument } from '@/features/hall-plan/schemas';
import { hallSizeLabel, selectionFrameOf, sizeLabelOf } from './hall-builder-view';

const DOCUMENT: HallDocument = {
  elements: [
    {
      id: 'e1',
      kind: 'wall',
      points: [
        { x: 0, y: 0 },
        { x: 2800, y: 0 },
        { x: 2800, y: 1800 },
      ],
      thicknessCm: 20,
    },
    { id: 'e2', kind: 'pillar', x: 400, y: 400, widthCm: 40, heightCm: 40, round: false },
  ],
};

describe('sizeLabelOf', () => {
  it.each([
    { bounds: null, expected: '—' },
    { bounds: { minX: 0, minY: 0, maxX: 2840, maxY: 1820 }, expected: '28,40 × 18,20 m' },
  ])('formats $bounds', ({ bounds, expected }) => {
    expect(sizeLabelOf(bounds)).toBe(expected);
  });
});

describe('hallSizeLabel', () => {
  it('measures the walls including their thickness', () => {
    expect(hallSizeLabel(DOCUMENT)).toBe('28,20 × 18,20 m');
  });
});

describe('selectionFrameOf', () => {
  it.each([
    { selection: [], frame: null },
    { selection: ['e2'], frame: { resizable: true, rotatable: false } },
    { selection: ['e1'], frame: { resizable: false, rotatable: true } },
    { selection: ['e1', 'e2'], frame: { resizable: false, rotatable: true } },
  ])('frames $selection', ({ selection, frame }) => {
    const result = selectionFrameOf(DOCUMENT, selection);

    expect(
      result === null ? null : { resizable: result.resizable, rotatable: result.rotatable },
    ).toEqual(frame);
  });
});
