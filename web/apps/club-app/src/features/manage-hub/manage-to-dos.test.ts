import { describe, expect, it } from 'vitest';
import type { ManageToDoRowModel } from './manage-to-dos';
import { toManageToDoBoard, toMarkOf, withToDoMark } from './manage-to-dos';
import type { ManageHub, ManageToDo } from './schemas';

const toDo = (overrides: Partial<ManageToDo>): ManageToDo => ({
  kind: 'applicationWaiting',
  count: 2,
  isSeen: false,
  newCount: 0,
  version: 'v1',
  ...overrides,
});

const hubWith = (toDos: ManageToDo[]): ManageHub => ({
  persons: null,
  groups: null,
  roles: null,
  board: null,
  clubRecord: null,
  sessions: null,
  venues: null,
  keys: null,
  accounts: null,
  applications: null,
  toDos,
});

describe('toManageToDoBoard', () => {
  it('keeps unseen to-dos on top and folds seen ones away, in the order they came', () => {
    const board = toManageToDoBoard([
      toDo({ kind: 'neverInvited' }),
      toDo({ kind: 'keyToTakeBack', isSeen: true }),
      toDo({ kind: 'applicationWaiting' }),
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 1 }),
    ]);

    expect(board.open.map((row) => row.kind)).toEqual(['neverInvited', 'applicationWaiting']);
    expect(board.seen.map((row) => row.kind)).toEqual(['keyToTakeBack', 'clubRecordGap']);
  });

  it.each<{
    entry: ManageToDo;
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
      const [row] = [...toManageToDoBoard([entry]).open, ...toManageToDoBoard([entry]).seen];

      expect(row?.countTone).toBe(tone);
      expect(row?.isSeenWhole).toBe(pressed);
      expect(row?.flag).toBe(flag);
    },
  );

  it.each<{ toDos: ManageToDo[]; label: string; flag: string | undefined }>([
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
    const board = toManageToDoBoard(toDos);

    expect(board.seenLabel).toBe(label);
    expect(board.seenFlag).toBe(flag);
  });
});

describe('toManageToDoBoard labels', () => {
  it.each<{ entry: ManageToDo; label: string }>([
    { entry: toDo({ kind: 'neverInvited', count: 4 }), label: 'Nie eingeladen' },
    { entry: toDo({ kind: 'inPersonOnly', count: 1 }), label: 'Nur vor Ort einladbar' },
    { entry: toDo({ kind: 'applicationWaiting', count: 2 }), label: 'Beitrittsanträge offen' },
  ])('starts the $entry.kind row as a sentence', ({ entry, label }) => {
    expect(toManageToDoBoard([entry]).open[0]?.label).toBe(label);
  });
});

describe('toMarkOf', () => {
  const rowOf = (entry: ManageToDo): ManageToDoRowModel => {
    const board = toManageToDoBoard([entry]);
    const [row] = [...board.open, ...board.seen];

    if (row === undefined) {
      throw new Error('no row');
    }

    return row;
  };

  it.each<{ entry: ManageToDo; seen: boolean }>([
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
    const hub = hubWith([
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 2 }),
      toDo({ kind: 'keyToTakeBack', isSeen: true, newCount: 1 }),
    ]);

    expect(withToDoMark(hub, { kind: 'clubRecordGap', version: 'v1', seen: true })?.toDos).toEqual([
      toDo({ kind: 'clubRecordGap', isSeen: true, newCount: 0 }),
      toDo({ kind: 'keyToTakeBack', isSeen: true, newCount: 1 }),
    ]);
  });

  it('returns an unmarked to-do to the top', () => {
    const hub = hubWith([toDo({ kind: 'keyToTakeBack', isSeen: true })]);

    expect(withToDoMark(hub, { kind: 'keyToTakeBack', version: 'v1', seen: false })?.toDos).toEqual(
      [toDo({ kind: 'keyToTakeBack', isSeen: false })],
    );
  });

  it('leaves an unloaded hub unloaded', () => {
    expect(
      withToDoMark(undefined, { kind: 'keyToTakeBack', version: 'v1', seen: true }),
    ).toBeUndefined();
  });
});
