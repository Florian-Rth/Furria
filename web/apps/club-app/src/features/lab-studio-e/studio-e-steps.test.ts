import { describe, expect, it } from 'vitest';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { clockOf, eightsOf, isFilmed, stepListOf } from './studio-e-steps';

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const video = (startSeconds: number, durationSeconds: number, outdated = false): StudioVideo => ({
  videoId: 1,
  mediaItemId: 1,
  name: null,
  state: 'ready',
  durationSeconds,
  startSeconds,
  placement: 'onTimeline',
  outdated,
  urls: { video: '/v', poster: '/p' },
});

const marks: CountMark[] = Array.from({ length: 40 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('clockOf', () => {
  it.each([
    [0, '0:00'],
    [9.9, '0:09'],
    [61, '1:01'],
    [178.4, '2:58'],
    [-3, '0:00'],
  ])('%s s reads %s', (seconds, text) => {
    expect(clockOf(seconds)).toBe(text);
  });
});

describe('eightsOf', () => {
  it.each([
    [{ start: 0, end: 8 }, 2],
    [{ start: 0, end: 6 }, 1.5],
    [{ start: 0, end: 5 }, 1.5],
    [{ start: 0, end: 4.5 }, 1],
  ])('%o lasts %s eights', (range, eights) => {
    expect(eightsOf(marks, range)).toBe(eights);
  });

  it('has no eights without a beat grid', () => {
    expect(eightsOf([], { start: 0, end: 8 })).toBeNull();
  });
});

describe('isFilmed', () => {
  it.each([
    [[video(15, 10)], true],
    [[video(20, 10)], false],
    [[video(0, 10)], false],
    [[video(15, 10, true)], false],
    [[], false],
  ])('step 10–20 with %o is filmed %s', (videos, filmed) => {
    expect(isFilmed(videos, { start: 10, end: 20 })).toBe(filmed);
  });
});

describe('stepListOf', () => {
  const parts: StudioPart[] = [
    { partId: 1, name: 'Marsch', stepIds: [1, 2], mainVideoId: null, adrift: false },
  ];

  it('groups the timed steps under their parts and numbers them through', () => {
    const steps = [step(1, 0, 4), step(2, 4, 8), step(9, null, null), step(3, 8, 10)];

    expect(stepListOf(steps, parts, [video(0, 4)], marks)).toEqual([
      {
        key: 'part-1',
        name: 'Marsch',
        start: 0,
        end: 8,
        rows: [
          { stepId: 1, number: 1, name: 'Schritt 1', start: 0, end: 4, eights: 1, filmed: true },
          { stepId: 2, number: 2, name: 'Schritt 2', start: 4, end: 8, eights: 1, filmed: false },
        ],
      },
      {
        key: 'step-3',
        name: null,
        start: 8,
        end: 10,
        rows: [
          {
            stepId: 3,
            number: 3,
            name: 'Schritt 3',
            start: 8,
            end: 10,
            eights: 0.5,
            filmed: false,
          },
        ],
      },
    ]);
  });
});
