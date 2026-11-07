import { describe, expect, it } from 'vitest';
import type { GestureInput, GestureIntent, GesturePolicy } from './gesture-recogniser';
import {
  initialGesture,
  longPressDeadlineOf,
  precisionOf,
  stepGesture,
  wheelPixelsOf,
} from './gesture-recogniser';

const EDIT: GesturePolicy = { drag: true, navigate: true, longPress: true, precision: 'none' };

const run = (inputs: readonly GestureInput[], policy: GesturePolicy = EDIT): GestureIntent[] => {
  let state = initialGesture();
  const intents: GestureIntent[] = [];
  for (const input of inputs) {
    const step = stepGesture(state, input, policy);
    state = step.state;
    intents.push(...step.intents);
  }

  return intents;
};

const kindsOf = (intents: readonly GestureIntent[]): string[] =>
  intents.map((intent) => intent.kind);

describe('stepGesture', () => {
  it('reports a short press without travel as a tap', () => {
    const intents = run([
      { type: 'down', id: 1, x: 10, y: 10, t: 0, kind: 'touch' },
      { type: 'move', id: 1, x: 14, y: 12, t: 40 },
      { type: 'up', id: 1, x: 14, y: 12, t: 90 },
    ]);

    expect(kindsOf(intents)).toEqual(['press', 'tap']);
  });

  it.each([
    { kind: 'touch' as const, travel: 7, drags: false },
    { kind: 'touch' as const, travel: 8, drags: true },
    { kind: 'mouse' as const, travel: 3, drags: true },
    { kind: 'mouse' as const, travel: 2, drags: false },
  ])('starts a $kind drag after $travel px: $drags', ({ kind, travel, drags }) => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind },
      { type: 'move', id: 1, x: travel, y: 0, t: 20 },
    ]);

    expect(kindsOf(intents).includes('dragStart')).toBe(drags);
  });

  it('follows a drag and ends it with the release velocity', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'move', id: 1, x: 20, y: 0, t: 20 },
      { type: 'move', id: 1, x: 40, y: 0, t: 40 },
      { type: 'up', id: 1, x: 60, y: 0, t: 60 },
    ]);

    expect(kindsOf(intents)).toEqual(['press', 'dragStart', 'drag', 'drag', 'dragEnd']);
    expect(intents.at(-1)).toEqual({
      kind: 'dragEnd',
      value: { x: 40, y: 0 },
      velocity: { x: 1, y: 0 },
    });
  });

  it('fires a long press at the deadline and keeps the hold until release', () => {
    const intents = run([
      { type: 'down', id: 1, x: 5, y: 5, t: 0, kind: 'touch' },
      { type: 'tick', t: 449 },
      { type: 'tick', t: 450 },
      { type: 'up', id: 1, x: 5, y: 5, t: 700 },
    ]);

    expect(kindsOf(intents)).toEqual(['press', 'longPress', 'holdEnd']);
  });

  it('fires an overdue long press on the next move before a held drag', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'move', id: 1, x: 30, y: 0, t: 600 },
    ]);

    expect(intents.slice(1, 3)).toEqual([
      { kind: 'longPress', point: { x: 0, y: 0 }, pointer: 'touch' },
      { kind: 'dragStart', origin: { x: 0, y: 0 }, point: { x: 30, y: 0 }, held: true },
    ]);
  });

  it('does not schedule a long press when the area has none', () => {
    const step = stepGesture(
      initialGesture(),
      { type: 'down', id: 1, x: 0, y: 0, t: 100, kind: 'touch' },
      { ...EDIT, longPress: false },
    );

    expect(longPressDeadlineOf(step.state)).toBeNull();
  });

  it('cancels the edit when a second finger joins and navigates instead', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'move', id: 1, x: 20, y: 0, t: 20 },
      { type: 'down', id: 2, x: 120, y: 0, t: 30, kind: 'touch' },
      { type: 'move', id: 2, x: 220, y: 0, t: 50 },
    ]);

    expect(kindsOf(intents)).toEqual([
      'press',
      'dragStart',
      'drag',
      'dragCancel',
      'navigateStart',
      'navigate',
    ]);
    expect(intents.at(-1)).toEqual({
      kind: 'navigate',
      focal: { x: 120, y: 0 },
      scale: 2,
      dx: 50,
      dy: 0,
    });
  });

  it('reports a two-finger pan as a translation without scale', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'down', id: 2, x: 100, y: 0, t: 5, kind: 'touch' },
      { type: 'move', id: 1, x: 0, y: 30, t: 20 },
      { type: 'move', id: 2, x: 100, y: 30, t: 21 },
    ]);

    const moves = intents.filter((intent) => intent.kind === 'navigate');
    const travel = moves.reduce(
      (sum, move) => ({
        scale: sum.scale * move.scale,
        dx: sum.dx + move.dx,
        dy: sum.dy + move.dy,
      }),
      { scale: 1, dx: 0, dy: 0 },
    );

    expect(travel.scale).toBeCloseTo(1, 6);
    expect({ dx: travel.dx, dy: travel.dy }).toEqual({ dx: 0, dy: 30 });
  });

  it('ends navigation on the first lift and ignores the remaining finger', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'down', id: 2, x: 100, y: 0, t: 5, kind: 'touch' },
      { type: 'up', id: 2, x: 100, y: 0, t: 40 },
      { type: 'move', id: 1, x: 80, y: 0, t: 60 },
      { type: 'up', id: 1, x: 80, y: 0, t: 80 },
    ]);

    expect(kindsOf(intents)).toEqual(['press', 'pressCancel', 'navigateStart', 'navigateEnd']);
  });

  it('keeps one-finger edits when the area does not navigate', () => {
    const intents = run(
      [
        { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
        { type: 'down', id: 2, x: 100, y: 0, t: 5, kind: 'touch' },
        { type: 'move', id: 1, x: 20, y: 0, t: 20 },
      ],
      { ...EDIT, navigate: false },
    );

    expect(kindsOf(intents)).toEqual(['press', 'dragStart', 'drag']);
  });

  it('slows the drag along the track as the finger moves away from it', () => {
    const intents = run(
      [
        { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
        { type: 'move', id: 1, x: 100, y: 0, t: 20 },
        { type: 'move', id: 1, x: 100, y: 120, t: 40 },
        { type: 'move', id: 1, x: 140, y: 120, t: 60 },
      ],
      { ...EDIT, precision: 'x' },
    );

    expect(intents.at(-1)).toEqual({
      kind: 'drag',
      point: { x: 140, y: 120 },
      value: { x: 110, y: 120 },
      delta: { x: 10, y: 0 },
      precision: 'quarter',
      held: false,
    });
  });

  it('cancels a drag when the browser takes the pointer', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'pen' },
      { type: 'move', id: 1, x: 30, y: 0, t: 20 },
      { type: 'cancel', id: 1 },
      { type: 'up', id: 1, x: 30, y: 0, t: 40 },
    ]);

    expect(kindsOf(intents)).toEqual(['press', 'dragStart', 'drag', 'dragCancel']);
  });

  it.each([
    { zoom: true, dy: 20, expected: { scale: Math.exp(-0.2), dx: 0, dy: 0 } },
    { zoom: false, dy: 20, expected: { scale: 1, dx: -4, dy: -20 } },
  ])('turns a wheel (zoom $zoom) into navigation', ({ zoom, dy, expected }) => {
    const intents = run([{ type: 'wheel', dx: 4, dy, x: 10, y: 10, zoom }]);

    expect(intents).toEqual([{ kind: 'navigate', focal: { x: 10, y: 10 }, ...expected }]);
  });
});

describe('stepGesture endings', () => {
  it.each([
    {
      name: 'a hold that moves where nothing drags',
      policy: { ...EDIT, drag: false },
      inputs: [
        { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
        { type: 'tick', t: 450 },
        { type: 'move', id: 1, x: 40, y: 0, t: 500 },
        { type: 'up', id: 1, x: 40, y: 0, t: 600 },
      ],
      kinds: ['press', 'longPress', 'holdEnd'],
    },
    {
      name: 'a press the browser cancels',
      policy: EDIT,
      inputs: [
        { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
        { type: 'cancel', id: 1 },
      ],
      kinds: ['press', 'pressCancel'],
    },
    {
      name: 'a mouse pressed again after its release got lost',
      policy: EDIT,
      inputs: [
        { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'mouse' },
        { type: 'move', id: 1, x: 20, y: 0, t: 20 },
        { type: 'down', id: 1, x: 50, y: 50, t: 900, kind: 'mouse' },
        { type: 'up', id: 1, x: 50, y: 50, t: 950 },
      ],
      kinds: ['press', 'dragStart', 'drag', 'dragCancel', 'press', 'tap'],
    },
  ] satisfies { name: string; policy: GesturePolicy; inputs: GestureInput[]; kinds: string[] }[])(
    'closes $name',
    ({ policy, inputs, kinds }) => {
      expect(kindsOf(run(inputs, policy))).toEqual(kinds);
    },
  );

  it('ends navigation without a fling after the fingers rested', () => {
    const intents = run([
      { type: 'down', id: 1, x: 0, y: 0, t: 0, kind: 'touch' },
      { type: 'down', id: 2, x: 100, y: 0, t: 5, kind: 'touch' },
      { type: 'move', id: 1, x: 60, y: 0, t: 20 },
      { type: 'up', id: 1, x: 60, y: 0, t: 600 },
    ]);

    expect(intents.at(-1)).toEqual({ kind: 'navigateEnd', velocity: { x: 0, y: 0 } });
  });
});

describe('wheelPixelsOf', () => {
  it.each([
    { unit: 'pixel' as const, expected: 3 },
    { unit: 'line' as const, expected: 48 },
    { unit: 'page' as const, expected: 1200 },
  ])('turns 3 $unit units into $expected px', ({ unit, expected }) => {
    expect(wheelPixelsOf(3, unit, 400)).toBe(expected);
  });
});

describe('precisionOf', () => {
  it.each([
    { distance: 0, tier: 'full' },
    { distance: -60, tier: 'half' },
    { distance: 120, tier: 'quarter' },
    { distance: 400, tier: 'fine' },
  ])('picks $tier at $distance px off the track', ({ distance, tier }) => {
    expect(precisionOf(distance).tier).toBe(tier);
  });
});
