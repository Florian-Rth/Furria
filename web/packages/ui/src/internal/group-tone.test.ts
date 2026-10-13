import { describe, expect, it } from 'vitest';
import { eventToneOf } from './group-tone';

describe('eventToneOf', () => {
  it.each([
    [1, 'olive'],
    [10, 'clay'],
    [23, 'fern'],
  ])('gives event %i the same tone on every surface', (eventId, tone) => {
    expect(eventToneOf(eventId)).toBe(tone);
  });
});
