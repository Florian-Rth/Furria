import { describe, expect, it } from 'vitest';
import type { SpotPath, TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { StudioVideo } from '@/features/acts/schemas';
import {
  blockStateOf,
  clockOf,
  dotsOf,
  eightSecondsOf,
  eightsInViewOf,
  keyframeMarksOf,
  loopSpanOf,
  motionSpansOf,
  nextRateOf,
  partBlocksOf,
  pixelsPerSecondOf,
  rangeLabelOf,
  scrubSecondsOf,
  songNameOf,
  stepBlocksOf,
  trackShiftOf,
  videoSpansOf,
} from './studio-c-timeline';

const keyframe = (seconds: number, rightMetres: number, backMetres: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const video = (patch: Partial<StudioVideo>): StudioVideo => ({
  videoId: 1,
  mediaItemId: 9,
  name: 'Probe',
  state: 'ready',
  durationSeconds: 40,
  startSeconds: 2,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
  ...patch,
});

describe('eightSecondsOf', () => {
  it.each([
    {
      label: 'eight beats of the usual gap',
      marks: [0, 0.5, 1, 1.5, 2.5].map((seconds) => ({ seconds, count: 1 })),
      expected: 4,
    },
    { label: 'a fallback without a beat grid', marks: [], expected: 4 },
    {
      label: 'a faster song',
      marks: [0, 0.25, 0.5, 0.75].map((seconds) => ({ seconds, count: 1 })),
      expected: 2,
    },
  ])('$label', ({ marks, expected }) => {
    expect(eightSecondsOf(marks)).toBeCloseTo(expected);
  });
});

describe('zoom', () => {
  it.each([
    { width: 390, eights: 2 },
    { width: 800, eights: 3 },
    { width: 1200, eights: 5 },
  ])('shows $eights eights across $width px', ({ width, eights }) => {
    expect(eightsInViewOf(width)).toBe(eights);
  });

  it('fits two eights of four seconds into a phone lane', () => {
    expect(pixelsPerSecondOf(400, 4)).toBe(50);
  });

  it('has no zoom before the lane is measured', () => {
    expect(pixelsPerSecondOf(0, 4)).toBe(0);
  });
});

describe('trackShiftOf', () => {
  it('puts the moment under the centre playhead', () => {
    expect(trackShiftOf(10, 50, 400)).toBe(-300);
  });
});

describe('scrubSecondsOf', () => {
  it.each([
    { label: 'dragging left moves forward', drag: -100, expected: 12 },
    { label: 'dragging right moves back', drag: 100, expected: 8 },
    { label: 'stops at the start', drag: 1000, expected: 0 },
    { label: 'stops at the end', drag: -10000, expected: 30 },
  ])('$label', ({ drag, expected }) => {
    expect(scrubSecondsOf(10, drag, 50, 30)).toBe(expected);
  });
});

describe('motionSpansOf', () => {
  it('splits the music into standing and moving stretches', () => {
    const path: SpotPath = {
      spotId: 1,
      keyframes: [keyframe(2, 0, 0), keyframe(4, 0, 0), keyframe(6, 2, 0), keyframe(8, 2, 1)],
    };

    expect(motionSpansOf(path, 10)).toEqual([
      { start: 0, end: 4, moving: false },
      { start: 4, end: 8, moving: true },
      { start: 8, end: 10, moving: false },
    ]);
  });

  it('has nothing for a viewer without a spot', () => {
    expect(motionSpansOf(null, 10)).toEqual([]);
  });

  it('stands the whole music on a single keyframe', () => {
    const path: SpotPath = { spotId: 1, keyframes: [keyframe(0, 1, 1)] };

    expect(motionSpansOf(path, 10)).toEqual([{ start: 0, end: 10, moving: false }]);
  });
});

describe('videoSpansOf', () => {
  it('places playable videos in time order and ends them with the music', () => {
    const videos = [
      video({ videoId: 2, startSeconds: 50, durationSeconds: 40 }),
      video({ videoId: 1, startSeconds: 2 }),
      video({ videoId: 3, outdated: true }),
    ];

    expect(videoSpansOf(videos, 60).map((span) => [span.videoId, span.start, span.end])).toEqual([
      [1, 2, 42],
      [2, 50, 60],
    ]);
  });
});

describe('blockStateOf', () => {
  it.each([
    { label: 'the looped block', loop: { start: 0, end: 4 }, current: true, expected: 'looped' },
    { label: 'the block under the playhead', loop: null, current: true, expected: 'current' },
    { label: 'any other block', loop: { start: 4, end: 8 }, current: false, expected: 'idle' },
  ])('$label', ({ loop, current, expected }) => {
    expect(blockStateOf({ start: 0, end: 4 }, loop, current)).toBe(expected);
  });
});

describe('nextRateOf', () => {
  it.each([
    { rate: 1, direction: 'slower' as const, expected: 0.9 },
    { rate: 0.5, direction: 'slower' as const, expected: 0.5 },
    { rate: 0.7, direction: 'faster' as const, expected: 0.8 },
    { rate: 1, direction: 'faster' as const, expected: 1 },
  ])('$rate $direction → $expected', ({ rate, direction, expected }) => {
    expect(nextRateOf(rate, direction)).toBe(expected);
  });
});

describe('formatting', () => {
  it.each([
    { seconds: 0, expected: '0:00,0' },
    { seconds: 17.36, expected: '0:17,3' },
    { seconds: 178.34, expected: '2:58,3' },
  ])('clock $seconds', ({ seconds, expected }) => {
    expect(clockOf(seconds)).toBe(expected);
  });

  it('writes a range in minutes', () => {
    expect(rangeLabelOf({ start: 15.24, end: 61.9 })).toBe('0:15–1:02');
  });

  it('drops the file extension of a song', () => {
    expect(songNameOf('02 Polka Medley v3.mp3')).toBe('02 Polka Medley v3');
  });
});

describe('dotsOf', () => {
  it('marks the own and open spots and draws the own dot last', () => {
    const dots = dotsOf(
      [
        {
          spotId: 1,
          position: { rightMetres: 0, backMetres: 1 },
          facingDegrees: 90,
          moving: false,
        },
        {
          spotId: 2,
          position: { rightMetres: 2, backMetres: 3 },
          facingDegrees: null,
          moving: true,
        },
        {
          spotId: 3,
          position: { rightMetres: -2, backMetres: 0 },
          facingDegrees: null,
          moving: false,
        },
      ],
      [
        {
          spotId: 1,
          number: 1,
          person: { personId: 7, firstName: 'L', lastName: 'B', portrait: null },
        },
        {
          spotId: 2,
          number: 2,
          person: { personId: 8, firstName: 'M', lastName: 'K', portrait: null },
        },
        { spotId: 3, number: 3, person: null },
      ],
      1,
      { widthMetres: 10, depthMetres: 7, artworkSvg: null },
      'audience',
    );

    expect(dots.map((dot) => [dot.number, dot.kind, dot.x, dot.y])).toEqual([
      [2, 'cast', 7, 4],
      [3, 'open', 3, 7],
      [1, 'own', 5, 6],
    ]);
  });
});

describe('blocks on the track', () => {
  const step = (stepId: number, startSeconds: number | null, endSeconds: number | null) => ({
    stepId,
    name: `S${stepId}`,
    description: null,
    startSeconds,
    endSeconds,
    placement: 'onTimeline' as const,
  });
  const steps = [step(1, 0, 4), step(2, 4, 10)];

  it('places steps in pixels and numbers them, marking the looped one', () => {
    const blocks = stepBlocksOf(steps, { start: 4, end: 10 }, 1, 10);

    expect(blocks.map((block) => [block.left, block.width, block.number, block.state])).toEqual([
      [0, 40, '1', 'current'],
      [40, 60, '2', 'looped'],
    ]);
  });

  it('spans a part over its steps and leaves out a part without placed steps', () => {
    const parts = [
      { partId: 1, name: 'A', stepIds: [1, 2], mainVideoId: null, adrift: false },
      { partId: 2, name: 'B', stepIds: [9], mainVideoId: null, adrift: false },
    ];

    expect(
      partBlocksOf(parts, steps, null, null, 10).map((block) => [block.left, block.width]),
    ).toEqual([[0, 100]]);
  });

  it('shades the loop in pixels', () => {
    expect(loopSpanOf({ start: 2, end: 5 }, 10)).toEqual({ left: 20, width: 30 });
    expect(loopSpanOf(null, 10)).toBeNull();
  });
});

describe('keyframeMarksOf', () => {
  it('marks every moment a formation point is set, once and in order', () => {
    const paths: SpotPath[] = [
      { spotId: 1, keyframes: [keyframe(4, 0, 0), keyframe(8, 1, 1)] },
      { spotId: 2, keyframes: [keyframe(2, 0, 0), keyframe(4, 1, 0)] },
    ];

    expect(keyframeMarksOf(paths, 10).map((mark) => mark.x)).toEqual([20, 40, 80]);
  });
});
