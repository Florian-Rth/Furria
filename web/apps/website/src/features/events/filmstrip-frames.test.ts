import { describe, expect, it } from 'vitest';
import { filmstripFramesOf } from './filmstrip-frames';

describe('filmstripFramesOf', () => {
  it('keeps each filled position at its own tilt, so a gap does not shift the others', () => {
    expect(filmstripFramesOf([1, 4, 9])).toEqual([
      { position: 1, transform: 'rotate(-2deg)' },
      { position: 4, transform: 'rotate(2deg)' },
      { position: 9, transform: 'rotate(-2deg)' },
    ]);
  });
});
