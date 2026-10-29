import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import type { ManualInput } from './studio-b-manual';
import {
  manualEntriesOf,
  manualOf,
  stripBandsOf,
  stripLoopOf,
  stripTicksOf,
} from './studio-b-manual';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const video: StudioVideo = {
  videoId: 5,
  mediaItemId: 50,
  name: null,
  state: 'ready',
  durationSeconds: 10,
  startSeconds: 0,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
};

const parts: StudioPart[] = [
  { partId: 10, name: 'Marsch', stepIds: [1, 2], mainVideoId: 5, adrift: false },
  { partId: 11, name: 'Polka', stepIds: [4], mainVideoId: null, adrift: false },
];

const timed = [step(1, 0, 4), step(2, 4, 12), step(3, 12, 16), step(4, 16, 20)];

const input: ManualInput = {
  steps: timed,
  allSteps: [...timed, { ...step(6, 0, 0), placement: 'cutAway', startSeconds: null }],
  parts,
  videos: [video],
  countMarks: Array.from({ length: 40 }, (_, index) => ({
    seconds: index * 0.5,
    count: (index % 8) + 1,
  })),
  paths: [],
  spots: [],
  stage: { widthMetres: 10, depthMetres: 8, artworkSvg: null },
  ownSpotId: null,
};

describe('manualOf', () => {
  const manual = manualOf(input);

  it('groups consecutive steps by part, a step without part on its own', () => {
    expect(
      manual.parts.map((part) => ({
        key: part.key,
        range: part.range,
        eights: part.eights,
        steps: part.steps.map((entry) => entry.number),
      })),
    ).toEqual([
      { key: 'part-10', range: { start: 0, end: 12 }, eights: 3, steps: [1, 2] },
      { key: 'unparted-12', range: { start: 12, end: 16 }, eights: 1, steps: [3] },
      { key: 'part-11', range: { start: 16, end: 20 }, eights: 1, steps: [4] },
    ]);
  });

  it('marks the steps a trainer video covers', () => {
    expect(manual.parts.flatMap((part) => part.steps.map((entry) => entry.hasVideo))).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it('lists steps outside the music separately', () => {
    expect(manual.loose.map((entry) => entry.stepId)).toEqual([6]);
  });

  it('lays the parts and step borders over the whole dance', () => {
    expect(stripBandsOf(manual, 20).map((band) => [band.start, band.end])).toEqual([
      [0, 0.6],
      [0.6, 0.8],
      [0.8, 1],
    ]);
    expect(stripTicksOf(manual, 20)).toEqual([0.2]);
  });
});

describe('stripLoopOf', () => {
  it.each([
    [{ start: 5, end: 10 }, 20, { start: 0.25, end: 0.5 }],
    [{ start: 15, end: 25 }, 20, { start: 0.75, end: 1 }],
    [null, 20, null],
    [{ start: 1, end: 2 }, 0, null],
  ])('%o over %s s', (loop, length, expected) => {
    expect(stripLoopOf(loop, length)).toEqual(expected);
  });
});

describe('manualEntriesOf', () => {
  const manual = manualOf(input);
  const shapeOf = (cardInList: boolean) =>
    manualEntriesOf(manual, 2, cardInList).map((entry) =>
      entry.kind === 'step' || entry.kind === 'part'
        ? `${entry.key}${entry.current ? '*' : ''}`
        : entry.key,
    );

  it('opens the current step into the card on the phone', () => {
    expect(shapeOf(true)).toEqual([
      'part-10*',
      'step-1',
      'card',
      'unparted-12',
      'step-3',
      'part-11',
      'step-4',
      'loose-6',
    ]);
  });

  it('only marks the current step when the card stands beside the list', () => {
    expect(shapeOf(false)).toContain('step-2*');
    expect(shapeOf(false)).not.toContain('card');
  });
});
