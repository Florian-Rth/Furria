import { describe, expect, it } from 'vitest';
import { vacancyToneOf } from './vacancy-tone';

describe('vacancyToneOf', () => {
  it('gives neighbouring positions of a series different tones', () => {
    const tones = [1, 2, 3, 4, 5, 6, 7, 8].map((position) =>
      vacancyToneOf('events.filmstrip', position),
    );

    expect(tones.every((tone, index) => index === 0 || tone !== tones[index - 1])).toBe(true);
  });
});
