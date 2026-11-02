import type { Patch } from 'immer';
import { describe, expect, it } from 'vitest';
import { patchedIfAllFit, patchedWhereFitting } from './document-patches';
import type { StudioDocument } from './studio-document';

const document: StudioDocument = {
  songOrder: [1],
  songs: {},
  steps: { 2: { startSeconds: 8, name: '', description: null } },
  parts: {},
  spotOrder: [],
  spots: {},
  tracks: {},
  videos: {},
  finalTracks: {},
};

describe('patchedWhereFitting', () => {
  it.each<{ name: string; patch: Patch; skipped: number }>([
    {
      name: 'a field of a known item',
      patch: { op: 'replace', path: ['steps', 2, 'name'], value: 'A' },
      skipped: 0,
    },
    {
      name: 'a field of a gone item',
      patch: { op: 'replace', path: ['steps', 3, 'name'], value: 'A' },
      skipped: 1,
    },
    { name: 'removing a gone item', patch: { op: 'remove', path: ['steps', 3] }, skipped: 1 },
    {
      name: 'adding an item',
      patch: {
        op: 'add',
        path: ['steps', -1],
        value: { startSeconds: 4, name: '', description: null },
      },
      skipped: 0,
    },
    {
      name: 'replacing a list',
      patch: { op: 'replace', path: ['songOrder'], value: [1, 2] },
      skipped: 0,
    },
  ])('$name skipped: $skipped', ({ patch, skipped }) => {
    expect(patchedWhereFitting(document, [patch]).skipped).toBe(skipped);
  });

  it('applies all patches or none', () => {
    expect(
      patchedIfAllFit(document, [
        { op: 'replace', path: ['steps', 2, 'name'], value: 'A' },
        { op: 'remove', path: ['steps', 3] },
      ]),
    ).toBeNull();
  });
});
