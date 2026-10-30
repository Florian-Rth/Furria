import { describe, expect, it } from 'vitest';
import { agendaMarkerDelayOf, agendaRowDelayOf } from './agenda-motion';

describe('agendaRowDelayOf', () => {
  it.each([
    [0, 0.04],
    [2, 0.14],
    [12, 0.64],
    [40, 0.64],
    [-3, 0.04],
  ])('row %i waits %f s', (order, seconds) => {
    expect(agendaRowDelayOf(order)).toBeCloseTo(seconds);
  });
});

describe('agendaMarkerDelayOf', () => {
  it('lands the marker after its row arrived', () => {
    expect(agendaMarkerDelayOf(1)).toBeGreaterThan(agendaRowDelayOf(1));
  });
});
