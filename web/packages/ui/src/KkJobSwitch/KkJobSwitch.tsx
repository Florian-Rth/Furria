import { KkJobSwitchRoot } from './internal/layout/KkJobSwitchRoot';
import { KkJobSwitchSegment } from './internal/ui/KkJobSwitchSegment';

export const KkJobSwitch = Object.assign(KkJobSwitchRoot, {
  Segment: KkJobSwitchSegment,
});
