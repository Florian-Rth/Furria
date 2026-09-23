import { describe, expect, it } from 'vitest';
import type { GlassDropPlan } from './glass-drop-plan';
import {
  arrivalOf,
  arrivalWaveFor,
  DEPARTURE_WAVE,
  departureOf,
  filterIdOf,
  rippleFrameAt,
  textArrivalOf,
  textDepartureOf,
} from './glass-drop-text';

describe('rippleFrameAt', () => {
  it.each([
    [0, 0, 0, '0.022 0.05'],
    [0.5, 17, 2.5, '0.018 0.115'],
    [1, 34, 5, '0.014 0.18'],
  ])('interpolates the departure at %d', (progress, scale, deviation, frequency) => {
    const frame = rippleFrameAt(DEPARTURE_WAVE, progress);

    expect(frame.scale).toBeCloseTo(scale);
    expect(frame.deviation).toBeCloseTo(deviation);
    expect(frame.frequency.split(' ').map(Number)).toEqual(
      frequency.split(' ').map((part) => expect.closeTo(Number(part))),
    );
  });

  it('calms the arrival to a sharp line', () => {
    expect(rippleFrameAt(arrivalWaveFor('exchange'), 1)).toMatchObject({ scale: 0, deviation: 0 });
  });
});

describe('textArrivalOf', () => {
  it.each([
    ['exchange', 1, { x: 0, y: -9 }],
    ['exchange', -1, { x: 0, y: 9 }],
    ['wobble', 1, { x: 0, y: -9 }],
    ['wave', 1, { x: 18, y: 0 }],
    ['wave', -1, { x: -18, y: 0 }],
  ] as const)('lets %s text arrive from the flow', (act, direction, from) => {
    expect(textArrivalOf(act, direction).from).toEqual(from);
  });

  it('waits for the drop to land before the text surfaces', () => {
    expect(textArrivalOf('exchange', 1).delay).toBeGreaterThan(textArrivalOf('wave', 1).delay);
  });
});

describe('textDepartureOf', () => {
  it.each([
    ['exchange', 1, { x: 0, y: 9 }],
    ['exchange', -1, { x: 0, y: -9 }],
    ['wave', 1, { x: -18, y: 0 }],
    ['wave', -1, { x: 18, y: 0 }],
  ] as const)('sends %s text away along the flow', (act, direction, to) => {
    expect(textDepartureOf(act, direction)).toEqual(to);
  });
});

describe('filterIdOf', () => {
  it.each([
    [':r1:', 'kk-glass-drop-r1'],
    ['«r2»', 'kk-glass-drop-r2'],
  ])('turns %s into a url-safe id', (reactId, id) => {
    expect(filterIdOf(reactId)).toBe(id);
  });
});

const planOf = (act: GlassDropPlan['act']): GlassDropPlan => ({
  act,
  direction: 1,
  from: 'broom',
  to: 'back',
  ghost: { kind: 'wordmark' },
});

describe('arrivalOf', () => {
  it.each([
    ['settled', null],
    ['fade', { from: { x: 0, y: 0 }, delay: 0, wave: null }],
    ['exchange', { from: { x: 0, y: -9 }, delay: 0.46 }],
    ['wave', { from: { x: 18, y: 0 }, delay: 0.06 }],
  ] as const)('cues the %s arrival', (act, cue) => {
    const arrival = arrivalOf(planOf(act));

    if (cue === null) {
      expect(arrival).toBeNull();
    } else {
      expect(arrival).toMatchObject(cue);
    }
  });

  it('ripples every animated arrival', () => {
    expect(arrivalOf(planOf('wobble'))?.wave).not.toBeNull();
  });
});

describe('departureOf', () => {
  it.each([
    ['settled', null],
    ['fade', { to: { x: 0, y: 0 }, wave: null }],
    ['exchange', { to: { x: 0, y: 9 }, wave: DEPARTURE_WAVE }],
  ] as const)('cues the %s departure', (act, cue) => {
    const departure = departureOf(planOf(act));

    if (cue === null) {
      expect(departure).toBeNull();
    } else {
      expect(departure).toMatchObject(cue);
    }
  });
});
