import { describe, expect, it } from 'vitest';
import { canvasScaleOf } from './canvas-scale';

const CANVAS = { width: 1280, height: 720 };

describe('canvasScaleOf', () => {
  it.each([
    { room: { width: 1920, height: 1080 }, expected: 1.5 },
    { room: { width: 1920, height: 1200 }, expected: 1.5 },
    { room: { width: 2560, height: 1080 }, expected: 1.5 },
    { room: { width: 640, height: 720 }, expected: 0.5 },
    { room: { width: 0, height: 720 }, expected: 1 },
    { room: { width: 1280, height: 0 }, expected: 1 },
  ])('scales the canvas into $room as $expected', ({ room, expected }) => {
    expect(canvasScaleOf(room, CANVAS)).toBe(expected);
  });
});
