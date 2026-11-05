import type { KkPlanStatusChipTone } from '@furria/ui/KkPlanStatusStrip';
import type { FindingTally } from '@/features/hall-plan/plan-clearance';

export const findingsToneOf = (tally: FindingTally): KkPlanStatusChipTone => {
  if (tally.conflicts > 0) {
    return 'conflict';
  }

  return tally.hints > 0 ? 'hint' : 'done';
};
