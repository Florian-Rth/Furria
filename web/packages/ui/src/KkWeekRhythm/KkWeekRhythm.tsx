import { KkWeekRhythmRoot } from './internal/layout/KkWeekRhythmRoot';
import { KkWeekRhythmDay } from './internal/ui/KkWeekRhythmDay';

export const KkWeekRhythm = Object.assign(KkWeekRhythmRoot, {
  Day: KkWeekRhythmDay,
});
