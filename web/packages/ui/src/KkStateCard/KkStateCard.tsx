import { KkStateCardRoot } from './internal/layout/KkStateCardRoot';
import { KkStateCardCell } from './internal/ui/KkStateCardCell';

export const KkStateCard = Object.assign(KkStateCardRoot, {
  Cell: KkStateCardCell,
});
