import { describe, expect, it } from 'vitest';
import type { EditState } from './edit-history';
import {
  canRedo,
  canUndo,
  edited,
  editStateOf,
  gestureEnded,
  gestureStarted,
  rebased,
  redone,
  savedUpTo,
  undone,
} from './edit-history';
import type { StudioChange } from './studio-changes';
import type { StudioDocument } from './studio-document';

const document = (patch: Partial<StudioDocument>): StudioDocument => ({
  songOrder: [],
  songs: {},
  steps: {
    1: { startSeconds: 0, endSeconds: 8, name: 'Auftakt' },
    2: { startSeconds: 8, endSeconds: 16, name: '' },
    3: { startSeconds: 16, endSeconds: 40, name: '' },
  },
  parts: {},
  spotOrder: [],
  spots: {},
  tracks: {},
  videos: { 5: { name: 'Probe', startSeconds: 2, clipStartSeconds: 0, clipEndSeconds: 30 } },
  ...patch,
});

const move = (atSeconds: number): StudioChange => ({
  kind: 'stepMove',
  stepId: 2,
  atSeconds,
});

const applied = (
  state: EditState,
  steps: readonly (StudioChange | 'start' | 'end')[],
  at: number,
): EditState =>
  steps.reduce<EditState>((current, step, index) => {
    if (step === 'start') {
      return gestureStarted(current, at + index);
    }

    return step === 'end' ? gestureEnded(current) : edited(current, step, at + index * 10);
  }, state);

const undoCountOf = (state: EditState): number => {
  let undos = 0;
  let current = state;
  while (canUndo(current)) {
    current = undone(current);
    undos += 1;
  }

  return undos;
};

describe('edited', () => {
  it.each([
    { name: 'merges quick nudges of one item', steps: [move(9), move(10), move(11)], undos: 1 },
    {
      name: 'makes one entry of a whole gesture',
      steps: [
        'start',
        move(9),
        move(10),
        { kind: 'stepRemove', stepId: 3 } as const,
        'end',
      ] as const,
      undos: 1,
    },
    { name: 'skips changes that change nothing', steps: [move(40)], undos: 0 },
  ])('$name', ({ steps, undos }) => {
    expect(undoCountOf(applied(editStateOf(document({})), steps, 0))).toBe(undos);
  });
});

describe('undone and redone', () => {
  it('restores the document and redoes it', () => {
    const start = editStateOf(document({}));
    const moved = applied(start, [move(9), { kind: 'stepRemove', stepId: 3 }], 0);
    const back = undone(undone(moved));
    const again = redone(back);

    expect([
      back.document,
      again.document.steps[2]?.startSeconds,
      again.document.steps[3] === undefined,
    ]).toEqual([start.document, 9, false]);
  });

  it('forgets the redo steps after a new change', () => {
    const state = edited(undone(edited(editStateOf(document({})), move(9), 0)), move(12), 5000);

    expect(canRedo(state)).toBe(false);
  });
});

describe('rebased', () => {
  it('replays pending changes on the newer state; the active edit wins', () => {
    const mine = applied(
      editStateOf(document({})),
      [move(9), { kind: 'stepName', stepId: 3, name: 'Mein' }],
      0,
    );
    const theirs = document({
      steps: {
        1: { startSeconds: 0, endSeconds: 8, name: 'Auftakt' },
        2: { startSeconds: 8, endSeconds: 16, name: 'Ihr Name' },
        3: { startSeconds: 16, endSeconds: 40, name: 'Ihr' },
      },
    });

    const result = rebased(mine, theirs, 'replayPending');

    expect(result.state.document.steps).toEqual({
      1: { startSeconds: 0, endSeconds: 9, name: 'Auftakt' },
      2: { startSeconds: 9, endSeconds: 16, name: 'Ihr Name' },
      3: { startSeconds: 16, endSeconds: 40, name: 'Mein' },
    });
  });

  it('drops undo steps whose items are gone and skips their changes', () => {
    const mine = applied(
      editStateOf(document({})),
      [
        { kind: 'videoName', videoId: 5, name: 'Generalprobe' },
        { kind: 'stepName', stepId: 3, name: 'Mein' },
      ],
      0,
    );
    const withoutStepThree = document({
      steps: {
        1: { startSeconds: 0, endSeconds: 8, name: 'Auftakt' },
        2: { startSeconds: 8, endSeconds: 16, name: '' },
      },
    });

    const result = rebased(mine, withoutStepThree, 'replayPending');

    expect([result.droppedUndoSteps, result.skippedChanges, undoCountOf(result.state)]).toEqual([
      2, 1, 0,
    ]);
  });

  it.each<[string, number, number, number]>([
    ['drops an undo step that would cut into the half split off meanwhile', 0, 15, 1],
    ['keeps an undo step that stays clear of the other half', 2, 20, 0],
  ])('%s', (_, startSeconds, endSeconds, dropped) => {
    const song = { mediaItemId: 3, firstBeatSeconds: null, tempoBpm: null };
    const mine = edited(
      editStateOf(
        document({ songOrder: [1], songs: { 1: { ...song, startSeconds: 0, endSeconds: 20 } } }),
      ),
      { kind: 'songSettings', songId: 1, ...song, startSeconds, endSeconds },
      0,
    );
    const split = document({
      songOrder: [1, 2],
      songs: {
        1: { ...song, startSeconds, endSeconds: 12 },
        2: { ...song, startSeconds: 12, endSeconds },
      },
    });

    expect(
      rebased(savedUpTo(mine, mine.pending.length), split, 'replayPending').droppedUndoSteps,
    ).toBe(dropped);
  });

  it('keeps spots and songs someone else added in the replayed order', () => {
    const mine = edited(
      editStateOf(document({ spotOrder: [1], spots: { 1: { person: null } } })),
      { kind: 'spotAdd', spotId: -1 },
      0,
    );
    const theirs = document({
      spotOrder: [1, 2],
      spots: { 1: { person: null }, 2: { person: null } },
    });

    expect(rebased(mine, theirs, 'replayPending').state.document.spotOrder).toEqual([1, -1, 2]);
  });
});
