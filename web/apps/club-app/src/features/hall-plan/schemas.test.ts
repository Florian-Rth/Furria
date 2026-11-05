import { describe, expect, it } from 'vitest';
import { HallDocumentSchema } from './schemas';

describe('HallDocumentSchema', () => {
  it('reads both area shapes the server sends, dropping the fields a shape does not use', () => {
    const parsed = HallDocumentSchema.parse({
      elements: [
        {
          id: 'a1',
          kind: 'area',
          shape: 'rect',
          area: 'stage',
          x: 1,
          y: 2,
          widthCm: 3,
          heightCm: 4,
          rotation: 0,
          label: null,
          points: null,
          from: null,
        },
        {
          id: 'a2',
          kind: 'area',
          shape: 'polygon',
          area: 'bar',
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ],
          x: null,
          widthCm: null,
          label: 'Theke',
        },
      ],
    });

    expect(parsed.elements.map((element) => Object.keys(element).sort())).toEqual([
      ['area', 'heightCm', 'id', 'kind', 'label', 'rotation', 'shape', 'widthCm', 'x', 'y'],
      ['area', 'id', 'kind', 'label', 'points', 'shape'],
    ]);
  });
});
