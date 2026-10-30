import { describe, expect, it } from 'vitest';
import type { MyAct } from '@/features/acts/schemas';
import { labDraftsOf } from './lab-drafts';

const act = (actId: number, groupId: number | null): MyAct => ({
  actId,
  name: `Tanz ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  group:
    groupId === null
      ? null
      : { groupId, name: `Gruppe ${groupId}`, tone: null, icon: null, picture: null },
  viewerInCast: true,
  viewerLeads: false,
  playable: true,
  cast: [],
  editors: [],
  nextEvening: null,
  nextTraining: null,
});

describe('labDraftsOf', () => {
  it('offers no drafts while she has no act', () => {
    expect(labDraftsOf([])).toEqual([]);
  });

  it.each([
    { acts: [act(3, 1), act(4, 1)], keys: ['act-3', 'act-4', 'group-1'] },
    { acts: [act(2, null)], keys: ['act-2'] },
    { acts: [act(3, 1), act(6, 3)], keys: ['act-3', 'act-6', 'group-1', 'group-3'] },
  ])('links every act and each of their groups once ($keys)', ({ acts, keys }) => {
    const drafts = labDraftsOf(acts);

    expect(
      drafts.every((draft) => draft.links.map((link) => link.key).join() === keys.join()),
    ).toBe(true);
  });
});
