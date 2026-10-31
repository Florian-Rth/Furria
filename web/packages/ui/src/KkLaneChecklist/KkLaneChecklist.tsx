import { KkLaneChecklistRoot } from './internal/layout/KkLaneChecklistRoot';
import { KkLaneChecklistRow } from './internal/ui/KkLaneChecklistRow';

export type { KkLaneChecklistState } from './internal/ui/KkLaneChecklistRow';

export const KkLaneChecklist = Object.assign(KkLaneChecklistRoot, {
  Row: KkLaneChecklistRow,
});
