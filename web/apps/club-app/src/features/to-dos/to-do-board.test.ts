import { describe, expect, it } from 'vitest';
import type { ToDo } from './schemas';
import type { ToDoRowModel } from './to-do-board';
import { toMarkOf, toToDoBoard, withToDoMark } from './to-do-board';

const toDo = (overrides: Partial<ToDo>): ToDo => ({
  kind: 'applicationWaiting',
  count: 2,
  isSeen: false,
  newCount: 0,
  version: 'v1',
  ...overrides,
});

describe('toToDoBoard', () => {
  it('keeps unseen to-dos on top and folds seen ones away, in the order they came', () => {
    const board = toToDoBoard([
      toDo({ kind: 'neverInvited' }),
      toDo({ kind: 'keyToTakeBack', isSeen: true }),
      toDo({ kind: 'applicationWaiting' }),
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 1 }),
    ]);

    expect(board.open.map((row) => row.kind)).toEqual(['neverInvited', 'applicationWaiting']);
    expect(board.seen.map((row) => row.kind)).toEqual(['keyToTakeBack', 'clubRecordGap']);
  });

  it.each<{
    entry: ToDo;
    tone: 'gold' | 'neutral';
    pressed: boolean;
    flagged: boolean;
  }>([
    { entry: toDo({ isSeen: false, newCount: 2 }), tone: 'gold', pressed: false, flagged: false },
    { entry: toDo({ isSeen: true, newCount: 0 }), tone: 'neutral', pressed: true, flagged: false },
    { entry: toDo({ isSeen: true, newCount: 2 }), tone: 'gold', pressed: false, flagged: true },
  ])(
    'paints a to-do seen $entry.isSeen with $entry.newCount new as $tone',
    ({ entry, tone, pressed, flagged }) => {
      const board = toToDoBoard([entry]);
      const [row] = [...board.open, ...board.seen];

      expect(row?.countTone).toBe(tone);
      expect(row?.isSeenWhole).toBe(pressed);
      expect(row?.flag !== undefined).toBe(flagged);
    },
  );

  it.each<{ toDos: ToDo[]; flagged: boolean }>([
    { toDos: [toDo({ isSeen: false, newCount: 4 })], flagged: false },
    { toDos: [toDo({ isSeen: true, newCount: 0 })], flagged: false },
    { toDos: [toDo({ isSeen: true, newCount: 1 })], flagged: true },
  ])('flags the fold $flagged when its to-dos carry news', ({ toDos, flagged }) => {
    expect(toToDoBoard(toDos).seenFlag !== undefined).toBe(flagged);
  });
});

describe('toMarkOf', () => {
  const rowOf = (entry: ToDo): ToDoRowModel => {
    const board = toToDoBoard([entry]);
    const [row] = [...board.open, ...board.seen];

    if (row === undefined) {
      throw new Error('no row');
    }

    return row;
  };

  it.each<{ entry: ToDo; seen: boolean }>([
    { entry: toDo({ isSeen: false }), seen: true },
    { entry: toDo({ isSeen: true, newCount: 3 }), seen: true },
    { entry: toDo({ isSeen: true, newCount: 0 }), seen: false },
  ])(
    'marks seen $seen when the to-do is seen $entry.isSeen with $entry.newCount new',
    ({ entry, seen }) => {
      expect(toMarkOf(rowOf(entry))).toEqual({ kind: entry.kind, version: entry.version, seen });
    },
  );
});

describe('withToDoMark', () => {
  it('moves only the marked to-do and clears its news', () => {
    const toDos = [
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 2 }),
      toDo({ kind: 'keyToTakeBack', isSeen: true, newCount: 1 }),
    ];

    expect(
      toDos.map((entry) =>
        withToDoMark(entry, { kind: 'clubRecordGap', version: 'v1', seen: true }),
      ),
    ).toEqual([
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 0 }),
      toDo({ kind: 'keyToTakeBack', isSeen: true, newCount: 1 }),
    ]);
  });
});
