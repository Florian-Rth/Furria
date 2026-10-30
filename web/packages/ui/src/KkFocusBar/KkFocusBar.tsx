import { KkFocusBarRoot } from './internal/layout/KkFocusBarRoot';
import { KkFocusBarChip } from './internal/ui/KkFocusBarChip';
import { KkFocusBarDivider } from './internal/ui/KkFocusBarDivider';
import { KkFocusBarNote } from './internal/ui/KkFocusBarNote';

export type { KkFocusBarKind } from './internal/layout/KkFocusBarRoot';

export const KkFocusBar = Object.assign(KkFocusBarRoot, {
  Chip: KkFocusBarChip,
  Note: KkFocusBarNote,
  Divider: KkFocusBarDivider,
});
