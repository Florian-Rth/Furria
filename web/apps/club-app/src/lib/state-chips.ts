import type { KkChipTone, KkFilterOption } from '@furria/ui';
import type { MembershipState } from '@/lib/api/schemas';
import { toMembershipStateLabel } from '@/lib/membership-labels';

export interface StateChip {
  label: string;
  tone: KkChipTone;
  dot: boolean;
}

interface StateChipPaint {
  tone: KkChipTone;
  dot: boolean;
}

const STATE_CHIP_PAINT: Record<MembershipState, StateChipPaint> = {
  active: { tone: 'green', dot: true },
  paused: { tone: 'gold', dot: true },
  ended: { tone: 'neutral', dot: false },
  none: { tone: 'neutral', dot: false },
};

export const toMembershipStateChip = (state: MembershipState): StateChip => ({
  label: toMembershipStateLabel(state),
  ...STATE_CHIP_PAINT[state],
});

const RUNNING_PERIOD_CHIP: StateChip = { label: 'läuft', tone: 'green', dot: true };
const PLANNED_PERIOD_CHIP: StateChip = { label: 'geplant', tone: 'neutral', dot: false };

export const toPeriodChip = (isRunning: boolean, isFuture: boolean): StateChip | null => {
  if (isRunning) {
    return RUNNING_PERIOD_CHIP;
  }
  if (isFuture) {
    return PLANNED_PERIOD_CHIP;
  }

  return null;
};

const RECRUITING_CHIP: StateChip = { label: 'sucht Verstärkung', tone: 'gold', dot: true };
const SETTLED_CHIP: StateChip = { label: 'sucht gerade niemanden', tone: 'neutral', dot: false };

export const toRecruitingChip = (isRecruiting: boolean): StateChip =>
  isRecruiting ? RECRUITING_CHIP : SETTLED_CHIP;

export const ALL_STATES_FILTER_ID = 'all';

const ALL_STATES_LABEL = 'Alle';
const STATE_FILTER_ORDER: readonly MembershipState[] = ['active', 'paused', 'ended', 'none'];

export const toStateFilterOptions = (counts: Record<MembershipState, number>): KkFilterOption[] => {
  const total = STATE_FILTER_ORDER.reduce((sum, state) => sum + counts[state], 0);
  const offered = STATE_FILTER_ORDER.filter((state) => counts[state] > 0).map((state) => ({
    id: state,
    label: toMembershipStateLabel(state),
    count: counts[state],
  }));

  return [{ id: ALL_STATES_FILTER_ID, label: ALL_STATES_LABEL, count: total }, ...offered];
};
