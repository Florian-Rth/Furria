import { describe, expect, it } from 'vitest';
import { canAnswer } from './calendar-answering';

describe('canAnswer', () => {
  it.each([
    { asksForResponse: true, mayAnswer: true, expected: true },
    { asksForResponse: true, mayAnswer: false, expected: false },
    { asksForResponse: false, mayAnswer: true, expected: false },
  ])(
    'answers $asksForResponse/$mayAnswer with $expected',
    ({ asksForResponse, mayAnswer, expected }) => {
      expect(canAnswer({ asksForResponse, mayAnswer })).toBe(expected);
    },
  );
});
