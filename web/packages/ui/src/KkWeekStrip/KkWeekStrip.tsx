import { KkWeekStripRoot } from './internal/layout/KkWeekStripRoot';
import { KkWeekStripDay } from './internal/ui/KkWeekStripDay';
import { KkWeekStripMark } from './internal/ui/KkWeekStripMark';

export const KkWeekStrip = Object.assign(KkWeekStripRoot, {
  Day: KkWeekStripDay,
  Mark: KkWeekStripMark,
});
