import { KkStatementListRoot } from './internal/layout/KkStatementListRoot';
import { KkStatementListSortRow } from './internal/layout/KkStatementListSortRow';
import { KkStatementListPressRow } from './internal/ui/KkStatementListPressRow';
import { KkStatementListRow } from './internal/ui/KkStatementListRow';

export type { KkStatementMark } from './internal/ui/KkStatementListRow';

export const KkStatementList = Object.assign(KkStatementListRoot, {
  Row: KkStatementListRow,
  SortRow: KkStatementListSortRow,
  PressRow: KkStatementListPressRow,
});
