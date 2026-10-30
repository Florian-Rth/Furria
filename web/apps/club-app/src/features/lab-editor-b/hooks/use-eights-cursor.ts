import type { SheetCursor, SheetRow } from '../count-sheet';
import { cursorAt } from '../count-sheet';

export const useEightsCursor = (rows: readonly SheetRow[], seconds: number): SheetCursor | null =>
  cursorAt(rows, seconds);
