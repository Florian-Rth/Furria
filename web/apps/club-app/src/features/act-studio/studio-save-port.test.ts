import { ApiError } from '@furria/api-client';
import type { SaveOutcome, ServerWrite } from '@furria/studio/save-port';
import { describe, expect, it } from 'vitest';
import { eveningTracksBodyOf, refusedSaveOf } from './studio-save-port';

const tracks: ServerWrite = { kind: 'tracks', baseVersion: 3, tracks: [] };
const stepMove: ServerWrite = { kind: 'stepMove', stepId: 4, atSeconds: 8 };

const conflict = new ApiError({
  kind: 'refused',
  status: 409,
  fields: [],
  payload: { overlaps: [{ spotId: 31, keyframes: [{ sourceMediaItemId: 1, seconds: 2 }] }] },
});

describe('refusedSaveOf', () => {
  it.each<{ name: string; write: ServerWrite; error: Error; outcome: SaveOutcome | null }>([
    {
      name: 'a choreography conflict names the refused spots',
      write: tracks,
      error: conflict,
      outcome: { kind: 'choreographyRefused', spotIds: [31] },
    },
    {
      name: 'a conflict payload on another write is a plain refusal',
      write: stepMove,
      error: conflict,
      outcome: { kind: 'rejected' },
    },
    {
      name: 'a refusal rejects the write',
      write: stepMove,
      error: new ApiError({ kind: 'refused', status: 400, fields: [] }),
      outcome: { kind: 'rejected' },
    },
    {
      name: 'a gone item rejects the write',
      write: stepMove,
      error: new ApiError({ kind: 'status', status: 404 }),
      outcome: { kind: 'rejected' },
    },
    {
      name: 'a server failure stays a failure',
      write: stepMove,
      error: new ApiError({ kind: 'status', status: 503 }),
      outcome: null,
    },
    {
      name: 'an unreachable server stays a failure',
      write: tracks,
      error: new ApiError({ kind: 'unreachable' }),
      outcome: null,
    },
  ])('$name', ({ write, error, outcome }) => {
    expect(refusedSaveOf(write, error)).toEqual(outcome);
  });
});

describe('eveningTracksBodyOf', () => {
  it.each([
    { copied: false, body: { baseVersion: null, sessionVersion: 3, tracks: [] } },
    { copied: true, body: { baseVersion: 3, sessionVersion: null, tracks: [] } },
  ])(
    'builds on the session until the evening has its own copy: copied=$copied',
    ({ copied, body }) => {
      expect(eveningTracksBodyOf({ kind: 'tracks', baseVersion: 3, tracks: [] }, copied)).toEqual(
        body,
      );
    },
  );
});
