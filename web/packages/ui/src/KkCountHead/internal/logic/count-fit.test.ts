import { describe, expect, it } from 'vitest';
import { countScaleOf } from './count-fit';

describe('countScaleOf', () => {
  it.each([
    { room: 70, face: 70, scale: 1 },
    { room: 84, face: 70, scale: 1.2 },
    { room: 50, face: 70, scale: 1 },
    { room: 140, face: 70, scale: 1.25 },
    { room: 70, face: 0, scale: 1 },
  ])('fits a $face px count into $room px: $scale', ({ room, face, scale }) => {
    expect(countScaleOf(room, face)).toBeCloseTo(scale, 5);
  });
});
