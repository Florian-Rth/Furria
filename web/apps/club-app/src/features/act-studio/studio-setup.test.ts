import { describe, expect, it } from 'vitest';
import type { Studio, StudioFinalTrack, StudioSong, StudioVideo } from '@/features/acts/schemas';
import { setupOf, setupStartsOpen } from './studio-setup';

const urls = { normalised: 'a', preview: 'b', peaks: 'p' };

const emptyStudio: Studio = {
  music: { lengthSeconds: 0, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [],
  trainings: [],
};

const song: StudioSong = {
  songId: 1,
  mediaItemId: 1,
  position: 0,
  startSeconds: 0,
  endSeconds: 60,
  firstBeatSeconds: 0,
  tempoBpm: 120,
  state: 'ready',
  durationSeconds: 60,
  fileName: 'a.mp3',
  urls,
};

const finalTrack: StudioFinalTrack = {
  finalTrackId: 1,
  mediaItemId: 2,
  version: 1,
  adopted: false,
  state: 'ready',
  durationSeconds: 60,
  fileName: 'b.mp3',
  firstBeatSeconds: null,
  tempoBpm: null,
  alignments: [],
  urls,
};

const video: StudioVideo = {
  videoId: 1,
  mediaItemId: 3,
  name: null,
  state: 'ready',
  durationSeconds: 10,
  startSeconds: 0,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: 'v', compact: 'c', poster: 'p' },
};

const person = { personId: 4, firstName: 'Lena', lastName: 'B', portrait: null };

const startedStudio: Studio = {
  ...emptyStudio,
  songs: [song],
  steps: [
    {
      stepId: 1,
      name: 'Einmarsch',
      description: null,
      startSeconds: 0,
      endSeconds: 8,
      placement: 'onTimeline',
    },
  ],
  spots: [
    { spotId: 1, number: 1, person },
    { spotId: 2, number: 2, person: null },
  ],
  choreography: {
    version: 1,
    tracks: [
      {
        spotId: 1,
        keyframes: [
          {
            sourceMediaItemId: 1,
            seconds: 0,
            position: { rightMetres: 0, backMetres: 0 },
            bend: null,
            easing: 'linear',
            facingDegrees: null,
          },
        ],
      },
      { spotId: 2, keyframes: [] },
    ],
  },
  finalTracks: [finalTrack],
};

describe('setupOf', () => {
  it('points an empty act at the music first and holds back what needs music', () => {
    const setup = setupOf(emptyStudio);
    expect(
      setup.rows.map((row) => [row.key, row.number, row.state, row.ready, row.optional]),
    ).toEqual([
      ['music', 1, 'next', true, false],
      ['steps', 2, 'open', false, false],
      ['spots', 3, 'open', true, false],
      ['formation', 4, 'open', false, false],
      ['video', 5, 'open', false, true],
      ['final', 6, 'open', true, true],
    ]);
    expect([setup.done, setup.total, setup.started, setup.complete]).toEqual([0, 4, false, false]);
  });

  it('counts what a started act already has', () => {
    const setup = setupOf({ ...startedStudio, spots: [] });
    expect(setup.rows.map((row) => [row.key, row.state, row.amount, row.open])).toEqual([
      ['music', 'done', 1, 0],
      ['steps', 'done', 1, 0],
      ['spots', 'next', 0, 0],
      ['formation', 'open', 0, 0],
      ['video', 'open', 0, 0],
      ['final', 'open', 1, 1],
    ]);
    expect([setup.done, setup.total, setup.started, setup.complete]).toEqual([2, 4, true, false]);
  });

  it('is complete without a trainer video and an adopted final file', () => {
    const setup = setupOf(startedStudio);
    expect(setup.rows.map((row) => [row.key, row.state])).toEqual([
      ['music', 'done'],
      ['steps', 'done'],
      ['spots', 'done'],
      ['formation', 'done'],
      ['video', 'open'],
      ['final', 'open'],
    ]);
    expect([setup.done, setup.total, setup.complete]).toEqual([4, 4, true]);
  });

  it('counts an adopted final file as music', () => {
    const setup = setupOf({ ...emptyStudio, finalTracks: [{ ...finalTrack, adopted: true }] });
    expect(setup.rows.map((row) => [row.key, row.state, row.ready])).toEqual([
      ['music', 'done', true],
      ['steps', 'next', true],
      ['spots', 'open', true],
      ['formation', 'open', false],
      ['video', 'open', true],
      ['final', 'done', true],
    ]);
  });

  it('only counts steps that sit on the music', () => {
    const setup = setupOf({
      ...startedStudio,
      steps: [
        {
          stepId: 1,
          name: 'Einmarsch',
          description: null,
          startSeconds: null,
          endSeconds: null,
          placement: 'cutAway',
        },
      ],
    });
    expect(setup.rows.map((row) => [row.key, row.state, row.ready])).toEqual([
      ['music', 'done', true],
      ['steps', 'next', true],
      ['spots', 'done', true],
      ['formation', 'done', false],
      ['video', 'open', true],
      ['final', 'open', true],
    ]);
  });

  it('counts only media that finished processing', () => {
    const setup = setupOf({
      ...emptyStudio,
      songs: [{ ...song, state: 'failed' }],
      videos: [{ ...video, state: 'processing' }],
      finalTracks: [{ ...finalTrack, adopted: true, state: 'processing' }],
    });
    expect(setup.rows.map((row) => [row.key, row.state, row.ready, row.amount])).toEqual([
      ['music', 'next', true, 0],
      ['steps', 'open', false, 0],
      ['spots', 'open', true, 0],
      ['formation', 'open', false, 0],
      ['video', 'open', false, 0],
      ['final', 'open', true, 0],
    ]);
  });

  it('leaves the optional rows out of the progress', () => {
    const setup = setupOf({
      ...emptyStudio,
      finalTracks: [{ ...finalTrack, adopted: true }],
      videos: [video],
    });
    expect([setup.done, setup.total, setup.started, setup.complete]).toEqual([1, 4, true, false]);
  });
});

describe('setupStartsOpen', () => {
  it.each([
    ['an untouched act', emptyStudio, false, true],
    ['a started act', startedStudio, false, false],
    ['an evening edit', emptyStudio, true, false],
  ])('%s', (_name, studio, onEvening, expected) => {
    expect(setupStartsOpen(studio, onEvening)).toBe(expected);
  });
});
