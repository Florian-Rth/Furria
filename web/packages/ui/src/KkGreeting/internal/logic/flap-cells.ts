export type KkGreetingPartRole = 'plain' | 'value' | 'name';

export interface KkGreetingPart {
  text: string;
  role: KkGreetingPartRole;
}

export type FlapCellKind = 'word' | 'digit' | 'mark';

export interface FlapCell {
  slot: string;
  face: string;
  kind: FlapCellKind;
  role: KkGreetingPartRole;
  accent: boolean;
  lead: string;
  trail: string;
}

const WHITESPACE = /^\s+$/;
const DIGIT = /^\d$/;
const WORD_SPLIT = /(\s+)/;
const FIRST_VALUE = 0;

interface CellBoard {
  cells: FlapCell[];
  pending: string;
}

const mergedRole = (
  current: KkGreetingPartRole,
  joining: KkGreetingPartRole,
): KkGreetingPartRole => (joining === 'name' ? 'name' : current);

const placeCell = (
  board: CellBoard,
  face: string,
  kind: FlapCellKind,
  role: KkGreetingPartRole,
  accent: boolean,
): void => {
  board.cells.push({
    slot: String(board.cells.length),
    face,
    kind,
    role,
    accent,
    lead: board.pending,
    trail: '',
  });
  board.pending = '';
};

const placeValue = (board: CellBoard, text: string, accent: boolean): void => {
  for (const char of Array.from(text)) {
    if (WHITESPACE.test(char)) {
      board.pending += char;
    } else {
      placeCell(board, char, DIGIT.test(char) ? 'digit' : 'mark', 'value', accent);
    }
  }
};

const placeWord = (board: CellBoard, word: string, role: KkGreetingPartRole): void => {
  const last = board.cells.at(-1);

  if (board.pending === '' && last !== undefined && last.kind === 'word') {
    board.cells[board.cells.length - 1] = {
      ...last,
      face: last.face + word,
      role: mergedRole(last.role, role),
    };
  } else {
    placeCell(board, word, 'word', role, false);
  }
};

const placeWords = (board: CellBoard, text: string, role: KkGreetingPartRole): void => {
  for (const token of text.split(WORD_SPLIT)) {
    if (WHITESPACE.test(token)) {
      board.pending += token;
    } else if (token !== '') {
      placeWord(board, token, role);
    }
  }
};

const placeTrail = (board: CellBoard): void => {
  const last = board.cells.at(-1);

  if (last !== undefined && board.pending !== '') {
    board.cells[board.cells.length - 1] = { ...last, trail: board.pending };
  }
};

export const toFlapCells = (parts: readonly KkGreetingPart[]): FlapCell[] => {
  const board: CellBoard = { cells: [], pending: '' };
  let values = 0;

  for (const part of parts) {
    if (part.role === 'value') {
      placeValue(board, part.text, values === FIRST_VALUE);
      values += 1;
    } else {
      placeWords(board, part.text, part.role);
    }
  }

  placeTrail(board);

  return board.cells;
};

export const countFlapCells = (parts: readonly KkGreetingPart[]): number =>
  toFlapCells(parts).length;

export const flapFacesOf = (cells: readonly FlapCell[]): string[] => cells.map((cell) => cell.face);

export const flapTextOf = (cells: readonly FlapCell[]): string =>
  cells.map((cell) => cell.lead + cell.face + cell.trail).join('');

const commonPrefixOf = (faces: readonly string[], previous: readonly string[]): number => {
  const limit = Math.min(faces.length, previous.length);
  let length = 0;

  while (length < limit && faces[length] === previous[length]) {
    length += 1;
  }

  return length;
};

const commonSuffixOf = (
  faces: readonly string[],
  previous: readonly string[],
  prefix: number,
): number => {
  const limit = Math.min(faces.length, previous.length) - prefix;
  let length = 0;

  while (
    length < limit &&
    faces[faces.length - 1 - length] === previous[previous.length - 1 - length]
  ) {
    length += 1;
  }

  return length;
};

export const previousFacesOf = (
  cells: readonly FlapCell[],
  previous: readonly string[] | null,
): (string | null)[] => {
  if (previous === null) {
    return cells.map(() => null);
  }

  const faces = flapFacesOf(cells);
  const prefix = commonPrefixOf(faces, previous);
  const suffix = commonSuffixOf(faces, previous, prefix);
  const shift = previous.length - faces.length;

  return faces.map((_, index) => {
    if (index < prefix) {
      return previous[index] ?? null;
    }
    if (index >= faces.length - suffix) {
      return previous[index + shift] ?? null;
    }

    const aligned = index + shift;

    return aligned >= prefix && aligned < previous.length - suffix
      ? (previous[aligned] ?? null)
      : null;
  });
};
