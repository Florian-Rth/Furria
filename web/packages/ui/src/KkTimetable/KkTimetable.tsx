import { KkTimetableRoot } from './internal/layout/KkTimetableRoot';
import { KkTimetableRow } from './internal/ui/KkTimetableRow';

export const KkTimetable = Object.assign(KkTimetableRoot, {
  Row: KkTimetableRow,
});
