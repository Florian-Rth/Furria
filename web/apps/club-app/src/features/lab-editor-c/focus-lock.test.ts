import { describe, expect, it } from 'vitest';
import { stepsEditableOf } from './focus-lock';

describe('stepsEditableOf', () => {
  it.each([
    { evening: false, editing: true, expected: true },
    { evening: true, editing: true, expected: false },
    { evening: false, editing: false, expected: false },
    { evening: true, editing: false, expected: false },
  ])('evening $evening, editing $editing', ({ evening, editing, expected }) => {
    expect(stepsEditableOf({ evening, editing })).toBe(expected);
  });
});
