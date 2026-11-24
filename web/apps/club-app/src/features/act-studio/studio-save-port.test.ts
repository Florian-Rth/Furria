import { describe, expect, it } from 'vitest';
import { eveningTracksBodyOf } from './studio-save-port';

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
