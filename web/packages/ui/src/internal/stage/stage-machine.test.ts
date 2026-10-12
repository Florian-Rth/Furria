import { describe, expect, it } from 'vitest';
import type { KkCrop } from '../../image-crop';
import type { StageFrame, StageTransform } from './stage-geometry';
import { cropOf } from './stage-geometry';
import type { StageInput, StageIntent, StagePolicy, StageState, StageView } from './stage-machine';
import { initialStage, keyInputOf, stepStage, viewOf } from './stage-machine';

const VIEWER: StagePolicy = {
  fit: 'contain',
  maxZoom: 4,
  doubleTapZoom: 2.5,
  swipe: true,
  pull: true,
  hasPrevious: true,
  hasNext: true,
  reducedMotion: false,
};

const CROP: StagePolicy = {
  fit: 'cover',
  maxZoom: 4,
  doubleTapZoom: 2,
  swipe: false,
  pull: false,
  hasPrevious: false,
  hasNext: false,
  reducedMotion: false,
};

const VIEWER_MEASURE: StageInput = {
  type: 'measure',
  stage: { width: 400, height: 300 },
  image: { width: 4000, height: 3000 },
};

const CROP_FRAME: StageFrame = {
  stage: { width: 400, height: 500 },
  image: { width: 4000, height: 3000 },
  fit: 'cover',
};

const CROP_MEASURE: StageInput = {
  type: 'measure',
  stage: CROP_FRAME.stage,
  image: CROP_FRAME.image,
};

interface Run {
  view: StageView;
  intents: StageIntent[];
  last: StageIntent[];
}

const run = (
  policy: StagePolicy,
  inputs: StageInput[],
  start: StageState = initialStage(),
): Run => {
  const outcome = inputs.reduce(
    (acc, input) => {
      const step = stepStage(acc.state, input, policy);
      return { state: step.state, intents: [...acc.intents, ...step.intents], last: step.intents };
    },
    { state: start, intents: [] as StageIntent[], last: [] as StageIntent[] },
  );

  return { view: viewOf(outcome.state), intents: outcome.intents, last: outcome.last };
};

const down = (x: number, y: number, t = 0, id = 1): StageInput => ({
  type: 'pointerDown',
  id,
  x,
  y,
  t,
});
const move = (x: number, y: number, t = 10, id = 1): StageInput => ({
  type: 'pointerMove',
  id,
  x,
  y,
  t,
});
const up = (x: number, y: number, t = 20, id = 1): StageInput => ({
  type: 'pointerUp',
  id,
  x,
  y,
  t,
});

const kindsOf = (intents: StageIntent[]): string[] => intents.map((intent) => intent.kind);

const expectTransform = (actual: StageTransform, expected: StageTransform): void => {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.zoom).toBeCloseTo(expected.zoom);
};

const expectCrop = (actual: KkCrop, expected: Partial<KkCrop>): void => {
  for (const [side, value] of Object.entries(expected)) {
    expect(actual[side as keyof KkCrop]).toBeCloseTo(value);
  }
};

describe('slop and axis lock', () => {
  it.each([
    { label: 'stays pending inside the slop', to: { x: 205, y: 150 }, phase: 'pending', track: 0 },
    {
      label: 'swipes once a horizontal drag leaves the slop',
      to: { x: 210, y: 150 },
      phase: 'swipe',
      track: 10,
    },
    {
      label: 'pulls once a downward drag leaves the slop',
      to: { x: 200, y: 170 },
      phase: 'pull',
      track: 0,
    },
    { label: 'ignores an upward drag', to: { x: 200, y: 100 }, phase: 'idle', track: 0 },
  ])('$label', ({ to, phase, track }) => {
    const { view } = run(VIEWER, [VIEWER_MEASURE, down(200, 150), move(to.x, to.y)]);

    expect(view.phase).toBe(phase);
    expect(view.track).toBe(track);
    expect(view.pull).toBe(0 + (phase === 'pull' ? 20 : 0));
  });

  it('holds a swipe through diagonal drift', () => {
    const { view } = run(VIEWER, [VIEWER_MEASURE, down(200, 150), move(220, 150), move(230, 350)]);

    expect(view.phase).toBe('swipe');
    expect(view.track).toBe(30);
    expect(view.pull).toBe(0);
  });

  it('holds a pull through sideways drift', () => {
    const { view } = run(VIEWER, [VIEWER_MEASURE, down(200, 150), move(200, 170), move(260, 190)]);

    expect(view.phase).toBe('pull');
    expect(view.pull).toBe(40);
    expect(view.track).toBe(0);
  });

  it('never moves an ignored upward drag', () => {
    const { view, intents } = run(VIEWER, [
      VIEWER_MEASURE,
      down(200, 150),
      move(200, 100),
      move(260, 0),
      up(260, 0),
    ]);

    expect(view.track).toBe(0);
    expect(view.pull).toBe(0);
    expect(kindsOf(intents)).toEqual(['transformed']);
  });
});

describe('zoomed pan', () => {
  const zoomed: StageInput[] = [VIEWER_MEASURE, { type: 'zoomTo', zoom: 2 }];

  it('pans instead of swiping while zoomed away from an edge', () => {
    const { view } = run(VIEWER, [...zoomed, down(200, 150), move(230, 150)]);

    expect(view.phase).toBe('pan');
    expect(view.track).toBe(0);
    expect(view.image.x).toBe(30);
  });

  it('hands the drag past the edge over to the neighbour track', () => {
    const { view } = run(VIEWER, [...zoomed, down(100, 150), move(360, 150)]);

    expect(view.image.x).toBe(200);
    expect(view.track).toBe(60);
  });

  it('rubber-bands at an edge without a neighbour instead of handing over', () => {
    const { view } = run({ ...VIEWER, hasPrevious: false }, [
      ...zoomed,
      down(100, 150),
      move(360, 150),
    ]);

    expect(view.track).toBe(0);
    expect(view.image.x).toBeGreaterThan(200);
    expect(view.image.x).toBeLessThan(260);
  });

  it('settles a rubber-banded pan back inside on release', () => {
    const { view, last } = run({ ...VIEWER, hasPrevious: false }, [
      ...zoomed,
      down(100, 150, 0),
      move(360, 150, 500),
      up(360, 150, 600),
    ]);

    expectTransform(view.image, { x: 200, y: 0, zoom: 2 });
    expect(view.motion).toBe('settle');
    expect(kindsOf(last)).toEqual(['transformed']);
  });

  it('steps when the handed-over track passes the commit distance', () => {
    const { last, view } = run(VIEWER, [
      ...zoomed,
      down(100, 150, 0),
      move(400, 150, 500),
      up(400, 150, 600),
    ]);

    expect(last).toContainEqual({ kind: 'step', delta: -1 });
    expect(view.track).toBe(400);
  });
});

describe('swipe release', () => {
  it.each([
    {
      label: 'steps forward after a slow drag past the commit distance',
      inputs: [down(200, 150, 0), move(100, 150, 500), up(100, 150, 600)],
      steps: [{ kind: 'step', delta: 1 }],
      track: -400,
      motion: 'slide',
    },
    {
      label: 'steps back after a slow drag past the commit distance',
      inputs: [down(200, 150, 0), move(300, 150, 500), up(300, 150, 600)],
      steps: [{ kind: 'step', delta: -1 }],
      track: 400,
      motion: 'slide',
    },
    {
      label: 'springs back after a slow short drag',
      inputs: [down(200, 150, 0), move(150, 150, 500), up(150, 150, 600)],
      steps: [],
      track: 0,
      motion: 'settle',
    },
    {
      label: 'steps after a short fast flick',
      inputs: [down(200, 150, 0), move(180, 150, 20), up(160, 150, 40)],
      steps: [{ kind: 'step', delta: 1 }],
      track: -400,
      motion: 'slide',
    },
    {
      label: 'springs back when the flick turns against the drag',
      inputs: [down(200, 150, 0), move(120, 150, 500), move(150, 150, 510), up(150, 150, 520)],
      steps: [],
      track: 0,
      motion: 'settle',
    },
  ])('$label', ({ inputs, steps, track, motion }) => {
    const { view, last } = run(VIEWER, [VIEWER_MEASURE, ...inputs]);

    expect(last.filter((intent) => intent.kind === 'step')).toEqual(steps);
    expect(view.track).toBe(track);
    expect(view.motion).toBe(motion);
  });

  it.each([
    { label: 'past the last photo', policy: { ...VIEWER, hasNext: false }, to: 50 },
    { label: 'before the first photo', policy: { ...VIEWER, hasPrevious: false }, to: 350 },
  ])('holds the drag tight $label and never steps', ({ policy, to }) => {
    const dragging = run(policy, [VIEWER_MEASURE, down(200, 150, 0), move(to, 150, 500)]);
    const released = run(policy, [
      VIEWER_MEASURE,
      down(200, 150, 0),
      move(to, 150, 500),
      up(to, 150, 520),
    ]);

    expect(Math.abs(dragging.view.track)).toBeCloseTo(150 * 0.16);
    expect(kindsOf(released.last)).toEqual([]);
    expect(released.view.track).toBe(0);
  });
});

describe('pull release', () => {
  it.each([
    {
      label: 'closes after a long pull',
      inputs: [down(200, 50, 0), move(200, 200, 500), up(200, 200, 600)],
      intents: ['pull'],
    },
    {
      label: 'closes after a short fast pull',
      inputs: [down(200, 50, 0), move(200, 70, 20), up(200, 90, 40)],
      intents: ['pull'],
    },
    {
      label: 'springs back after a short slow pull',
      inputs: [down(200, 50, 0), move(200, 110, 500), up(200, 110, 600)],
      intents: [],
    },
  ])('$label', ({ inputs, intents }) => {
    const { view, last } = run(VIEWER, [VIEWER_MEASURE, ...inputs]);

    expect(kindsOf(last)).toEqual(intents);
    expect(view.pull).toBe(0);
  });
});

describe('pinch', () => {
  it('zooms around the midpoint of both fingers', () => {
    const { view } = run(VIEWER, [
      VIEWER_MEASURE,
      down(300, 150, 0, 1),
      down(400, 150, 0, 2),
      move(500, 150, 10, 2),
    ]);

    expect(view.phase).toBe('pinch');
    expectTransform(view.image, { x: -100, y: 0, zoom: 2 });
  });

  it('turns into a pan without a jump when one finger lifts', () => {
    const pinched: StageInput[] = [
      VIEWER_MEASURE,
      down(100, 150, 0, 1),
      down(300, 150, 0, 2),
      move(0, 150, 10, 1),
      move(400, 150, 10, 2),
      up(0, 150, 20, 1),
    ];
    const lifted = run(VIEWER, pinched);
    const panned = run(VIEWER, [...pinched, move(450, 150, 30, 2)]);

    expectTransform(lifted.view.image, { x: 0, y: 0, zoom: 2 });
    expect(panned.view.phase).toBe('pan');
    expectTransform(panned.view.image, { x: 50, y: 0, zoom: 2 });
  });

  it('switches a running swipe to a pinch and drops its track', () => {
    const { view } = run(VIEWER, [
      VIEWER_MEASURE,
      down(200, 150, 0, 1),
      move(260, 150, 10, 1),
      down(300, 150, 20, 2),
    ]);

    expect(view.phase).toBe('pinch');
    expect(view.track).toBe(0);
  });

  it('never zooms out past the whole photo', () => {
    const { view } = run(VIEWER, [
      VIEWER_MEASURE,
      down(100, 150, 0, 1),
      down(300, 150, 0, 2),
      move(190, 150, 10, 1),
      move(210, 150, 10, 2),
    ]);

    expect(view.image.zoom).toBe(1);
  });
});

describe('taps', () => {
  const tap = (x: number, t: number): StageInput[] => [down(x, 150, t), up(x, 150, t + 50)];

  it('reports a single tap', () => {
    expect(kindsOf(run(VIEWER, [VIEWER_MEASURE, ...tap(300, 0)]).last)).toEqual(['tap']);
  });

  it('zooms in around the point on a double tap', () => {
    const { view, last } = run(VIEWER, [VIEWER_MEASURE, ...tap(300, 0), ...tap(300, 200)]);

    expectTransform(view.image, { x: -150, y: 0, zoom: 2.5 });
    expect(last).toContainEqual({ kind: 'zoomed', zoomed: true });
  });

  it('zooms back out on the next double tap', () => {
    const { view, last } = run(VIEWER, [
      VIEWER_MEASURE,
      ...tap(300, 0),
      ...tap(300, 200),
      ...tap(300, 1000),
      ...tap(300, 1200),
    ]);

    expectTransform(view.image, { x: 0, y: 0, zoom: 1 });
    expect(last).toContainEqual({ kind: 'zoomed', zoomed: false });
  });

  it.each([
    { label: 'too slow', second: { x: 300, t: 600 } },
    { label: 'too far apart', second: { x: 360, t: 200 } },
  ])('keeps two taps $label as single taps', ({ second }) => {
    const { view, last } = run(VIEWER, [
      VIEWER_MEASURE,
      ...tap(300, 0),
      ...tap(second.x, second.t),
    ]);

    expect(view.image.zoom).toBe(1);
    expect(kindsOf(last)).toEqual(['tap']);
  });
});

describe('wheel and keys', () => {
  it.each([
    {
      label: 'a pinch wheel zooms in around the pointer',
      policy: VIEWER,
      inputs: [{ type: 'wheel', dx: 0, dy: -50, x: 200, y: 150, pinch: true, t: 0 }],
      expected: { x: 0, y: 0, zoom: Math.exp(0.5) },
    },
    {
      label: 'a plain wheel leaves an unzoomed viewer alone',
      policy: VIEWER,
      inputs: [{ type: 'wheel', dx: 30, dy: 30, x: 200, y: 150, pinch: false, t: 0 }],
      expected: { x: 0, y: 0, zoom: 1 },
    },
    {
      label: 'a plain wheel pans a zoomed viewer',
      policy: VIEWER,
      inputs: [
        { type: 'zoomTo', zoom: 2 },
        { type: 'wheel', dx: 30, dy: 0, x: 200, y: 150, pinch: false, t: 0 },
      ],
      expected: { x: -30, y: 0, zoom: 2 },
    },
    {
      label: 'a Safari pinch scales around its point',
      policy: VIEWER,
      inputs: [{ type: 'pinchGesture', scale: 2, x: 300, y: 150, t: 0 }],
      expected: { x: -100, y: 0, zoom: 2 },
    },
    {
      label: 'the plus key zooms in on the centre',
      policy: VIEWER,
      inputs: [{ type: 'zoomKey', direction: 1 }],
      expected: { x: 0, y: 0, zoom: 1.25 },
    },
    {
      label: 'the zero key returns to rest',
      policy: VIEWER,
      inputs: [
        { type: 'zoomTo', zoom: 3 },
        { type: 'panKey', dx: 1, dy: 0 },
        { type: 'zoomKey', direction: 0 },
      ],
      expected: { x: 0, y: 0, zoom: 1 },
    },
  ] satisfies {
    label: string;
    policy: StagePolicy;
    inputs: StageInput[];
    expected: StageTransform;
  }[])('$label', ({ policy, inputs, expected }) => {
    expectTransform(run(policy, [VIEWER_MEASURE, ...inputs]).view.image, expected);
  });

  it('leaves a Safari pinch to the touch pointers that already zoom', () => {
    const { view } = run(VIEWER, [
      VIEWER_MEASURE,
      down(300, 150, 0, 1),
      down(400, 150, 0, 2),
      { type: 'pinchGesture', scale: 2, x: 350, y: 150, t: 5 },
    ]);

    expect(view.image.zoom).toBe(1);
  });

  it.each([
    {
      label: 'zooms on plus in an unzoomed viewer',
      key: '+',
      policy: VIEWER,
      zoom: 1,
      expected: { type: 'zoomKey', direction: 1 },
    },
    {
      label: 'leaves arrows to the steps in an unzoomed viewer',
      key: 'ArrowLeft',
      policy: VIEWER,
      zoom: 1,
      expected: null,
    },
    {
      label: 'pans on arrows in a zoomed viewer',
      key: 'ArrowLeft',
      policy: VIEWER,
      zoom: 2,
      expected: { type: 'panKey', dx: -1, dy: 0 },
    },
    {
      label: 'pans on arrows in a crop frame',
      key: 'ArrowDown',
      policy: CROP,
      zoom: 1,
      expected: { type: 'panKey', dx: 0, dy: 1 },
    },
    { label: 'ignores other keys', key: 'x', policy: CROP, zoom: 1, expected: null },
  ])('$label', ({ key, policy, zoom, expected }) => {
    const state = [VIEWER_MEASURE, { type: 'zoomTo', zoom } satisfies StageInput].reduce(
      (current, input) => stepStage(current, input, policy).state,
      initialStage(),
    );

    expect(keyInputOf(key, state, policy)).toEqual(expected);
  });

  it('zooms a crop frame with a plain wheel', () => {
    const { view } = run(CROP, [
      CROP_MEASURE,
      { type: 'wheel', dx: 0, dy: -100, x: 200, y: 250, pinch: false, t: 0 },
    ]);

    expect(view.image.zoom).toBeCloseTo(Math.exp(0.125));
  });

  it('moves the crop toward the arrow key', () => {
    const { view } = run(CROP, [
      CROP_MEASURE,
      { type: 'zoomTo', zoom: 2 },
      { type: 'panKey', dx: 1, dy: 0 },
    ]);

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0.35 + 20 / ((2 * 4000) / 6) });
  });
});

describe('crop frame', () => {
  it('starts on the stored cut once the frame is measured', () => {
    const stored = { left: 0.1, top: 0.2, width: 0.3, height: 0.5 };
    const { view, last } = run(CROP, [CROP_MEASURE], initialStage(stored));

    expectCrop(cropOf(view.image, CROP_FRAME), stored);
    expect(kindsOf(last)).toContain('transformed');
  });

  it('starts on the largest centred cut without a stored one', () => {
    const { view } = run(CROP, [CROP_MEASURE]);

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0.2, top: 0, width: 0.6, height: 1 });
  });

  it('keeps the cut when the frame is resized', () => {
    const stored = { left: 0.1, top: 0.2, width: 0.3, height: 0.5 };
    const { view } = run(
      CROP,
      [CROP_MEASURE, { type: 'measure', stage: { width: 800, height: 1000 } }],
      initialStage(stored),
    );

    expectCrop(cropOf(view.image, { ...CROP_FRAME, stage: { width: 800, height: 1000 } }), stored);
  });

  it('pans an unzoomed crop along its spare axis', () => {
    const { view } = run(CROP, [
      CROP_MEASURE,
      down(200, 250, 0),
      move(250, 250, 10),
      up(250, 250, 20),
    ]);

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0.2 - 50 / (4000 / 6) });
  });

  it('moves the cut against the drag', () => {
    const { view } = run(CROP, [
      CROP_MEASURE,
      { type: 'zoomTo', zoom: 2 },
      down(200, 250, 0),
      move(300, 125, 10),
      up(300, 125, 20),
    ]);

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0.275, top: 0.375 });
  });

  it('never shows empty space after a drag far past the edges', () => {
    const { view } = run(CROP, [
      CROP_MEASURE,
      down(200, 250, 0),
      move(3000, -2000, 10),
      up(3000, -2000, 20),
    ]);

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0, top: 0, width: 0.6, height: 1 });
  });

  it('pulls the cut back inside when zooming out near an edge', () => {
    const { view } = run(
      CROP,
      [CROP_MEASURE, { type: 'zoomTo', zoom: 1 }],
      initialStage({ left: 0.825, top: 0.775, width: 0.15, height: 0.25 }),
    );

    expectCrop(cropOf(view.image, CROP_FRAME), { left: 0.4, top: 0 });
  });

  it('reports each settled cut', () => {
    const { last } = run(CROP, [CROP_MEASURE, { type: 'zoomTo', zoom: 3 }]);

    expect(kindsOf(last)).toEqual(['transformed', 'zoomed']);
  });
});

describe('motion', () => {
  it('continues from what is on screen when a finger catches a settling photo', () => {
    const shown = { x: 50, y: 10, zoom: 2 };
    const { view } = run(VIEWER, [
      VIEWER_MEASURE,
      { type: 'zoomTo', zoom: 2 },
      { type: 'pointerDown', id: 1, x: 200, y: 150, t: 0, shown },
    ]);

    expect(view.image).toEqual(shown);
    expect(view.motion).toBe('follow');
  });

  it.each([
    {
      label: 'a committed swipe',
      inputs: [down(200, 150, 0), move(100, 150, 500), up(100, 150, 600)],
    },
    {
      label: 'a released pull',
      inputs: [down(200, 50, 0), move(200, 110, 500), up(200, 110, 600)],
    },
    { label: 'a key zoom', inputs: [{ type: 'zoomKey', direction: 1 } as const] },
  ])('turns $label instant under reduced motion', ({ inputs }) => {
    const { view } = run({ ...VIEWER, reducedMotion: true }, [VIEWER_MEASURE, ...inputs]);

    expect(view.motion).toBe('instant');
  });

  it('rests instantly and unzoomed after a reset', () => {
    const { view, last } = run(VIEWER, [
      VIEWER_MEASURE,
      { type: 'zoomTo', zoom: 3 },
      { type: 'reset' },
    ]);

    expectTransform(view.image, { x: 0, y: 0, zoom: 1 });
    expect(view.motion).toBe('instant');
    expect(last).toContainEqual({ kind: 'zoomed', zoomed: false });
  });
});
