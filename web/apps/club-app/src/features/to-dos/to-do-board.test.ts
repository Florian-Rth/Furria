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
    flag: string | undefined;
  }>([
    { entry: toDo({ isSeen: false }), tone: 'gold', pressed: false, flag: undefined },
    { entry: toDo({ isSeen: true, newCount: 0 }), tone: 'neutral', pressed: true, flag: undefined },
    { entry: toDo({ isSeen: true, newCount: 2 }), tone: 'gold', pressed: false, flag: '2 neu' },
  ])(
    'paints a to-do seen $entry.isSeen with $entry.newCount new as $tone',
    ({ entry, tone, pressed, flag }) => {
      const board = toToDoBoard([entry]);
      const [row] = [...board.open, ...board.seen];

      expect(row?.countTone).toBe(tone);
      expect(row?.isSeenWhole).toBe(pressed);
      expect(row?.flag).toBe(flag);
    },
  );

  it.each<{ toDos: ToDo[]; label: string; flag: string | undefined }>([
    { toDos: [toDo({ isSeen: false })], label: 'Gesehen · 0', flag: undefined },
    {
      toDos: [
        toDo({ kind: 'keyToTakeBack', isSeen: true, newCount: 1 }),
        toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 2 }),
        toDo({ kind: 'neverInvited', isSeen: true }),
      ],
      label: 'Gesehen · 3',
      flag: '3 neu',
    },
  ])('counts the fold as $label and its news as $flag', ({ toDos, label, flag }) => {
    const board = toToDoBoard(toDos);

    expect(board.seenLabel).toBe(label);
    expect(board.seenFlag).toBe(flag);
  });
});

describe('toToDoBoard labels', () => {
  it.each<{ entry: ToDo; label: string }>([
    { entry: toDo({ kind: 'neverInvited', count: 4 }), label: 'Nie eingeladen' },
    { entry: toDo({ kind: 'inPersonOnly', count: 1 }), label: 'Nur vor Ort einladbar' },
    { entry: toDo({ kind: 'applicationWaiting', count: 2 }), label: 'Beitrittsanträge offen' },
  ])('starts the $entry.kind row as a sentence', ({ entry, label }) => {
    expect(toToDoBoard([entry]).open[0]?.label).toBe(label);
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

  it('returns an unmarked to-do to the top', () => {
    expect(
      withToDoMark(toDo({ kind: 'keyToTakeBack', isSeen: true }), {
        kind: 'keyToTakeBack',
        version: 'v1',
        seen: false,
      }),
    ).toEqual(toDo({ kind: 'keyToTakeBack', isSeen: false }));
  });
});
