import { KkHealthStripFilters } from './internal/layout/KkHealthStripFilters';
import { KkHealthStripRoot } from './internal/layout/KkHealthStripRoot';
import { KkHealthStripFilter } from './internal/ui/KkHealthStripFilter';
import { KkHealthStripSummary } from './internal/ui/KkHealthStripSummary';

export const KkHealthStrip = Object.assign(KkHealthStripRoot, {
  Summary: KkHealthStripSummary,
  Filters: KkHealthStripFilters,
  Filter: KkHealthStripFilter,
});
