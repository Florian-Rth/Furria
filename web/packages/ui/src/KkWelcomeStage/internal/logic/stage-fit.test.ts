import { describe, expect, it } from 'vitest';
import { stageScaleOf } from './stage-fit';

const BOUNDS = { least: 0.5, most: 3 };

describe('stageScaleOf', () => {
  it.each([
    { room: { width: 360, height: 1000 }, face: { width: 240, height: 80 }, expected: 1.5 },
    { room: { width: 360, height: 120 }, face: { width: 240, height: 80 }, expected: 1.5 },
    { room: { width: 360, height: 100 }, face: { width: 240, height: 80 }, expected: 1.25 },
    { room: { width: 360, height: 1000 }, face: { width: 60, height: 20 }, expected: 3 },
    { room: { width: 360, height: 10 }, face: { width: 240, height: 80 }, expected: 0.5 },
    { room: { width: 360, height: 0 }, face: { width: 240, height: 80 }, expected: 1 },
    { room: { width: 360, height: 100 }, face: { width: 0, height: 80 }, expected: 1 },
  ])('fits $face into $room as $expected', ({ room, face, expected }) => {
    expect(stageScaleOf(room, face, BOUNDS)).toBe(expected);
  });
});
