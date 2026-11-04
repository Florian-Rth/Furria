import { describe, expect, it } from 'vitest';
import { sparkGeometryOf } from './pour-spark';

const frame = { width: 110, height: 30, pad: 5, maxForecastSteps: 10 };

describe('sparkGeometryOf', () => {
  it('scales the history to the frame with the peak at the top', () => {
    expect(sparkGeometryOf([0, 10, 5], null, frame)).toMatchObject({
      history: 'M5 25 L55 5 L105 15',
      forecast: null,
      empty: null,
    });
  });

  it('runs the forecast from now to the floor on the projected empty step', () => {
    expect(sparkGeometryOf([10, 5], 1, frame)).toMatchObject({
      history: 'M5 5 L55 15',
      forecast: 'M55 15 L105 25',
      empty: { x: 105, y: 25 },
    });
  });

  it('caps a far forecast so the history keeps its room', () => {
    expect(sparkGeometryOf([10, 5], 40, frame).now.x).toBe(14.1);
  });
});
