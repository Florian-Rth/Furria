import { KkStateGridRoot } from './internal/layout/KkStateGridRoot';
import { KkStateGridCell } from './internal/ui/KkStateGridCell';
import { KkStateGridRow } from './internal/ui/KkStateGridRow';

export const KkStateGrid = Object.assign(KkStateGridRoot, {
  Row: KkStateGridRow,
  Cell: KkStateGridCell,
});
