import { describe, expect, it } from 'vitest';
import type { HallDocument } from '@/features/hall-plan/schemas';
import type { HallDraft } from './hall-gesture';
import { overlayOf } from './hall-overlay';

const DOCUMENT: HallDocument = {
  elements: [
    {
      id: 'e1',
      kind: 'wall',
      points: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
      ],
      thicknessCm: 20,
    },
    {
      id: 'e2',
      kind: 'area',
      shape: 'rect',
      area: 'stage',
      x: 200,
      y: 200,
      widthCm: 300,
      heightCm: 100,
      rotation: 0,
      label: null,
    },
  ],
};

describe('overlayOf', () => {
  it.each<{ draft: HallDraft; tool: 'select' | 'wall'; frame: boolean; vertices: number }>([
    { draft: { kind: 'idle' }, tool: 'select', frame: true, vertices: 2 },
    { draft: { kind: 'idle' }, tool: 'wall', frame: false, vertices: 0 },
    {
      draft: { kind: 'marquee', from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, additive: false },
      tool: 'select',
      frame: false,
      vertices: 0,
    },
  ])('frames the wall in $tool with a $draft.kind draft', ({ draft, tool, frame, vertices }) => {
    const overlay = overlayOf(DOCUMENT, ['e1'], draft, tool, 'stage');

    expect(overlay.frame !== null).toBe(frame);
    expect(overlay.vertices).toHaveLength(vertices);
  });

  it('measures the segment being drawn', () => {
    const overlay = overlayOf(
      DOCUMENT,
      [],
      { kind: 'polyline', tool: 'wall', points: [{ x: 0, y: 0 }], cursor: { x: 300, y: 400 } },
      'wall',
      'stage',
    );

    expect(overlay.polyline?.points).toHaveLength(2);
    expect(overlay.measure?.label).toBe('5,00 m');
  });

  it('shows the area being dragged with the chosen kind', () => {
    const overlay = overlayOf(
      DOCUMENT,
      [],
      { kind: 'drag', tool: 'area', from: { x: 0, y: 0 }, to: { x: 200, y: 100 } },
      'area',
      'bar',
    );

    expect(overlay.area).toMatchObject({ area: 'bar', x: 100, y: 50, widthCm: 200, heightCm: 100 });
  });
});
