import { describe, expect, it } from 'vitest';
import type { HallDocument, Point } from '@/features/hall-plan/schemas';
import type { GestureContext, GesturePointer, HallDraft } from './hall-gesture';
import {
  finishPolyline,
  IDLE_DRAFT,
  pointerCancel,
  pointerDown,
  pointerMove,
  pointerUp,
  previewDocument,
  vertexHandleId,
  vertexIndexOf,
} from './hall-gesture';

const ROOM: HallDocument = {
  elements: [
    {
      id: 'e1',
      kind: 'area',
      area: 'stage',
      x: 500,
      y: 500,
      widthCm: 200,
      heightCm: 100,
      rotation: 0,
      label: null,
    },
  ],
};

const contextOf = (overrides: Partial<GestureContext>): GestureContext => ({
  document: ROOM,
  selection: [],
  tool: 'select',
  scale: 1,
  areaKind: 'bar',
  ...overrides,
});

const pointerAt = (at: Point, overrides: Partial<GesturePointer> = {}): GesturePointer => ({
  at,
  screen: at,
  handleId: null,
  shiftKey: false,
  altKey: false,
  pointerType: 'mouse',
  ...overrides,
});

describe('wall drawing', () => {
  it('snaps each new point to 45° and whole decimetres from the last one', () => {
    const context = contextOf({ tool: 'wall', document: { elements: [] } });
    const started = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 0, y: 0 }));
    const next = pointerDown(context, started.draft, pointerAt({ x: 403, y: 12 }));

    expect(next.draft).toMatchObject({
      kind: 'polyline',
      points: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
      ],
    });
  });

  it('closes the room when the first point is hit again', () => {
    const context = contextOf({ tool: 'wall', document: { elements: [] } });
    const draft: HallDraft = {
      kind: 'polyline',
      tool: 'wall',
      points: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: 400, y: 300 },
      ],
      cursor: { x: 400, y: 300 },
    };
    const closed = pointerDown(context, draft, pointerAt({ x: 2, y: 1 }));
    const [wall] = closed.document?.elements ?? [];

    expect(wall?.kind === 'wall' ? wall.points : []).toHaveLength(4);
    expect(closed.draft.kind).toBe('idle');
    expect(closed.selection).toEqual([wall?.id]);
  });

  it.each([
    { points: [{ x: 0, y: 0 }], created: 0 },
    {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      created: 0,
    },
    {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 300, y: 0 },
      ],
      created: 1,
    },
  ])('finishes a line of $points.length points into $created element', ({ points, created }) => {
    const draft: HallDraft = { kind: 'polyline', tool: 'line', points, cursor: { x: 0, y: 0 } };
    const result = finishPolyline({ elements: [] }, draft);

    expect(result.document?.elements ?? []).toHaveLength(created);
  });
});

describe('drag tools', () => {
  it.each([
    { tool: 'door' as const, to: { x: 10, y: 0 }, created: 0 },
    { tool: 'door' as const, to: { x: 100, y: 0 }, created: 1 },
    { tool: 'area' as const, to: { x: 300, y: 10 }, created: 0 },
    { tool: 'area' as const, to: { x: 300, y: 200 }, created: 1 },
  ])('$tool dragged to $to creates $created', ({ tool, to, created }) => {
    const context = contextOf({ tool, document: { elements: [] } });
    const down = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 0, y: 0 }));
    const moved = pointerMove(context, down.draft, pointerAt(to));
    const up = pointerUp(context, moved.draft);

    expect(up.document?.elements ?? []).toHaveLength(created);
  });

  it('gives a new area the last chosen kind', () => {
    const context = contextOf({ tool: 'area', document: { elements: [] }, areaKind: 'wardrobe' });
    const up = pointerUp(context, {
      kind: 'drag',
      tool: 'area',
      from: { x: 0, y: 0 },
      to: { x: 200, y: 200 },
    });

    expect(up.document?.elements[0]).toMatchObject({ kind: 'area', area: 'wardrobe' });
  });

  it('switches to selecting after placing a text', () => {
    const result = pointerDown(
      contextOf({ tool: 'text' }),
      IDLE_DRAFT,
      pointerAt({ x: 40, y: 40 }),
    );

    expect(result.tool).toBe('select');
    expect(result.document?.elements).toHaveLength(2);
  });
});

describe('selecting', () => {
  it('moves the hit element on the grid', () => {
    const context = contextOf({});
    const down = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 500, y: 500 }));
    const moved = pointerMove(
      context,
      down.draft,
      pointerAt({ x: 534, y: 467 }, { altKey: false }),
    );
    const up = pointerUp(context, moved.draft);

    expect(down.selection).toEqual(['e1']);
    expect(up.document?.elements[0]).toMatchObject({ x: 530, y: 470 });
  });

  it('leaves the plan untouched when the element is only clicked', () => {
    const context = contextOf({});
    const down = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 500, y: 500 }));

    expect(pointerUp(context, down.draft).document).toBeUndefined();
  });

  it.each([
    { pointerType: 'mouse', kind: 'marquee' },
    { pointerType: 'touch', kind: 'pan' },
  ])('a $pointerType press on empty floor starts a $kind', ({ pointerType, kind }) => {
    const result = pointerDown(
      contextOf({}),
      IDLE_DRAFT,
      pointerAt({ x: 0, y: 0 }, { pointerType }),
    );

    expect(result.draft.kind).toBe(kind);
  });

  it.each([
    { to: { x: 700, y: 700 }, additive: false, selection: ['e1'] },
    { to: { x: 450, y: 700 }, additive: false, selection: [] },
    { to: { x: 0.2, y: 0.2 }, additive: true, selection: ['e9'] },
  ])('a marquee to $to selects $selection', ({ to, additive, selection }) => {
    const context = contextOf({ selection: ['e9'] });
    const up = pointerUp(context, { kind: 'marquee', from: { x: 0, y: 0 }, to, additive });

    expect(up.selection).toEqual(selection);
  });

  it('toggles a hit element with shift', () => {
    const context = contextOf({ selection: ['e1'] });
    const result = pointerDown(
      context,
      IDLE_DRAFT,
      pointerAt({ x: 500, y: 500 }, { shiftKey: true }),
    );

    expect(result.selection).toEqual([]);
  });

  it('pans by the screen distance', () => {
    const result = pointerMove(
      contextOf({}),
      { kind: 'pan', last: { x: 10, y: 10 } },
      pointerAt({ x: 25, y: 5 }),
    );

    expect(result.pan).toEqual({ x: 15, y: -5 });
  });
});

describe('handles', () => {
  it('resizes the east edge and keeps the west edge in place', () => {
    const context = contextOf({ selection: ['e1'] });
    const down = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 600, y: 500 }, { handleId: 'e' }));
    const moved = pointerMove(context, down.draft, pointerAt({ x: 702, y: 500 }));
    const area = previewDocument(ROOM, moved.draft).elements[0];

    expect(area).toMatchObject({ x: 550, widthCm: 300 });
  });

  it('rotates in 15° steps unless shift is held', () => {
    const context = contextOf({ selection: ['e1'] });
    const down = pointerDown(
      context,
      IDLE_DRAFT,
      pointerAt({ x: 600, y: 500 }, { handleId: 'rotate' }),
    );
    const snapped = pointerMove(context, down.draft, pointerAt({ x: 600, y: 540 }));
    const free = pointerMove(
      context,
      down.draft,
      pointerAt({ x: 600, y: 540 }, { shiftKey: true }),
    );

    expect(snapped.draft).toMatchObject({ kind: 'rotate', degrees: 15 });
    expect(free.draft.kind === 'rotate' ? Math.round(free.draft.degrees) : null).toBe(22);
  });
});

describe('measuring', () => {
  it('measures with two clicks', () => {
    const context = contextOf({ tool: 'measure', document: { elements: [] } });
    const first = pointerDown(context, IDLE_DRAFT, pointerAt({ x: 0, y: 0 }));
    const released = pointerUp(context, first.draft);
    const second = pointerDown(context, released.draft, pointerAt({ x: 300, y: 400 }));

    expect(second.draft).toMatchObject({ kind: 'measure', to: { x: 300, y: 400 }, settled: true });
  });

  it('keeps a settled measure when a pinch cancels the gesture', () => {
    const settled: HallDraft = {
      kind: 'measure',
      from: { x: 0, y: 0 },
      to: { x: 10, y: 0 },
      settled: true,
      dragging: false,
    };

    expect(pointerCancel(settled)).toBe(settled);
    expect(pointerCancel({ kind: 'pan', last: { x: 0, y: 0 } }).kind).toBe('idle');
  });
});

describe('vertexIndexOf', () => {
  it.each([
    { handle: vertexHandleId(3), expected: 3 },
    { handle: 'rotate', expected: null },
    { handle: null, expected: null },
    { handle: 'vertex:x', expected: null },
  ])('reads $handle', ({ handle, expected }) => {
    expect(vertexIndexOf(handle)).toBe(expected);
  });
});
