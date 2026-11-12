import { KkCoverageGridHead } from './internal/layout/KkCoverageGridHead';
import { KkCoverageGridRoot } from './internal/layout/KkCoverageGridRoot';
import { KkCoverageGridRow } from './internal/layout/KkCoverageGridRow';
import { KkCoverageGridCell } from './internal/ui/KkCoverageGridCell';
import { KkCoverageGridHeadCell } from './internal/ui/KkCoverageGridHeadCell';
import { KkCoverageGridLegend } from './internal/ui/KkCoverageGridLegend';
import { KkCoverageGridRowHead } from './internal/ui/KkCoverageGridRowHead';

export type { KkCoverageGridLegendEntry } from './internal/ui/KkCoverageGridLegend';

export const KkCoverageGrid = Object.assign(KkCoverageGridRoot, {
  Head: KkCoverageGridHead,
  HeadCell: KkCoverageGridHeadCell,
  Row: KkCoverageGridRow,
  RowHead: KkCoverageGridRowHead,
  Cell: KkCoverageGridCell,
  Legend: KkCoverageGridLegend,
});
