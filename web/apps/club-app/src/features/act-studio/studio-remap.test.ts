import { describe, expect, it } from 'vitest';
import type { IdRename } from './studio-remap';
import { renameOf, writeRenamed } from './studio-remap';
import type { StudioWrite } from './studio-undo';

const songs: IdRename = { entity: 'song', renames: new Map([[5, 9]]) };
const spots: IdRename = { entity: 'spot', renames: new Map([[30, 40]]) };
const videos: IdRename = { entity: 'video', renames: new Map([[3, 7]]) };

describe('renameOf', () => {
  it.each<{ name: string; applied: StudioWrite; created: number[]; rename: IdRename | null }>([
    {
      name: 'a restored song',
      applied: { kind: 'songRemove', songId: 5 },
      created: [9],
      rename: songs,
    },
    {
      name: 'restored steps in order',
      applied: { kind: 'stepsRemove', stepIds: [1, 2] },
      created: [11, 12],
      rename: {
        entity: 'step',
        renames: new Map([
          [1, 11],
          [2, 12],
        ]),
      },
    },
    {
      name: 'a restore that created a different count',
      applied: { kind: 'stepsRemove', stepIds: [1] },
      created: [11, 12],
      rename: null,
    },
    {
      name: 'a write that removed nothing',
      applied: { kind: 'songOrder', songIds: [1] },
      created: [],
      rename: null,
    },
  ])('$name', ({ applied, created, rename }) => {
    expect(renameOf(applied, created)).toEqual(rename);
  });
});

describe('writeRenamed', () => {
  it.each<{ name: string; rename: IdRename; write: StudioWrite; renamed: StudioWrite }>([
    {
      name: 'song settings',
      rename: songs,
      write: {
        kind: 'songSettings',
        songId: 5,
        settings: { startSeconds: 0, endSeconds: 1, firstBeatSeconds: null, tempoBpm: null },
      },
      renamed: {
        kind: 'songSettings',
        songId: 9,
        settings: { startSeconds: 0, endSeconds: 1, firstBeatSeconds: null, tempoBpm: null },
      },
    },
    {
      name: 'a song order',
      rename: songs,
      write: { kind: 'songOrder', songIds: [1, 5] },
      renamed: { kind: 'songOrder', songIds: [1, 9] },
    },
    {
      name: 'paths keyed by spot',
      rename: spots,
      write: { kind: 'tracks', changes: { 30: [], 31: [] } },
      renamed: { kind: 'tracks', changes: { 40: [], 31: [] } },
    },
    {
      name: 'the main video of a part',
      rename: videos,
      write: {
        kind: 'partSettings',
        partId: 3,
        settings: { name: 'A', firstStepId: 3, mainVideoId: 3 },
      },
      renamed: {
        kind: 'partSettings',
        partId: 3,
        settings: { name: 'A', firstStepId: 3, mainVideoId: 7 },
      },
    },
    {
      name: 'every part of a batch',
      rename: spots,
      write: {
        kind: 'batch',
        writes: [
          { kind: 'spotAssign', spotId: 30, person: null },
          { kind: 'spotAssign', spotId: 31, person: null },
        ],
      },
      renamed: {
        kind: 'batch',
        writes: [
          { kind: 'spotAssign', spotId: 40, person: null },
          { kind: 'spotAssign', spotId: 31, person: null },
        ],
      },
    },
  ])('renames ids in $name', ({ rename, write, renamed }) => {
    expect(writeRenamed(rename, write)).toEqual(renamed);
  });
});
