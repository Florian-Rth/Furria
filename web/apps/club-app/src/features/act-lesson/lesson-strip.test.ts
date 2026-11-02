import { describe, expect, it } from 'vitest';
import { lessonStripOf, stripStepIdOf } from './lesson-strip';

const step = (stepId: number, startSeconds: number, endSeconds: number) => ({
  stepId,
  name: '',
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline' as const,
});

const steps = [step(11, 2, 6), step(12, 6, 10), step(13, 12, 20)];
const parts = [
  { partId: 1, name: 'A', stepIds: [11, 12], mainVideoId: null, adrift: false },
  { partId: 2, name: 'B', stepIds: [99], mainVideoId: null, adrift: false },
  { partId: 3, name: 'C', stepIds: [13], mainVideoId: null, adrift: false },
];

describe('lessonStripOf', () => {
  it('places parts and steps as shares of the music', () => {
    const strip = lessonStripOf(steps, parts, 20);

    expect([
      strip.parts.map((part) => [part.key, part.from, part.to, part.shade]),
      strip.ticks.map((tick) => [tick.key, tick.from, tick.to]),
    ]).toEqual([
      [
        [1, 0.1, 0.5, 0],
        [3, 0.6, 1, 2],
      ],
      [
        [11, 0.1, 0.3],
        [12, 0.3, 0.5],
        [13, 0.6, 1],
      ],
    ]);
  });

  it('draws nothing without music', () => {
    expect(lessonStripOf(steps, parts, 0)).toEqual({ parts: [], ticks: [] });
  });
});

describe('stripStepIdOf', () => {
  it.each([
    { share: 0, expected: 11 },
    { share: 0.2, expected: 11 },
    { share: 0.35, expected: 12 },
    { share: 0.52, expected: 13 },
    { share: 1, expected: 13 },
  ])('jumps to the step under share $share', ({ share, expected }) => {
    expect(stripStepIdOf(steps, share, 20)).toBe(expected);
  });
});
