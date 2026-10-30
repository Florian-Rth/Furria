import { KkFocusPopRoot } from './internal/layout/KkFocusPopRoot';
import { KkFocusPopNote } from './internal/ui/KkFocusPopNote';
import { KkFocusPopRow } from './internal/ui/KkFocusPopRow';

export type { KkFocusPopTone } from './internal/layout/KkFocusPopRoot';
export type { KkFocusPopRowState } from './internal/ui/KkFocusPopRow';

export const KkFocusPop = Object.assign(KkFocusPopRoot, {
  Row: KkFocusPopRow,
  Note: KkFocusPopNote,
});
