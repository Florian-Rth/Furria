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

export const toSessionPeriodChip = (
  firstSessionYear: number,
  lastSessionYear: number | null,
  currentSessionYear: number,
): StateChip | null => {
  if (currentSessionYear < firstSessionYear) {
    return PLANNED_PERIOD_CHIP;
  }
  if (lastSessionYear === null || currentSessionYear <= lastSessionYear) {
    return RUNNING_PERIOD_CHIP;
  }

  return null;
};

const RECRUITING_CHIP: StateChip = { label: 'sucht Verstärkung', tone: 'gold', dot: true };
const SETTLED_CHIP: StateChip = { label: 'sucht gerade niemanden', tone: 'neutral', dot: false };

export const toRecruitingChip = (isRecruiting: boolean): StateChip =>
  isRecruiting ? RECRUITING_CHIP : SETTLED_CHIP;

export const ARCHIVED_CHIP: StateChip = { label: 'archiviert', tone: 'neutral', dot: false };

export const UNARCHIVED_LABEL = 'im Verein';

export const UNHELD_CHIP: StateChip = { label: 'unbesetzt', tone: 'gold', dot: false };

export const GROUP_ADMIN_CHIP: StateChip = { label: 'Gruppen-Admin', tone: 'accent', dot: false };

export const MY_GROUP_CHIP: StateChip = { label: 'deine Gruppe', tone: 'ink', dot: false };

export const READ_ONLY_CHIP: StateChip = { label: 'nur Ansicht', tone: 'neutral', dot: false };

export const WITHHELD_CHIP: StateChip = {
  label: 'nicht freigegeben',
  tone: 'neutral',
  dot: false,
};

export interface SwitchStateChips {
  on: StateChip;
  off: StateChip;
}

export const SWITCH_STATE_CHIP: SwitchStateChips = {
  on: { label: 'an', tone: 'green', dot: false },
  off: { label: 'aus', tone: 'neutral', dot: false },
};

export const SWITCH_STATE_LABELS = {
  on: SWITCH_STATE_CHIP.on.label,
  off: SWITCH_STATE_CHIP.off.label,
};

export const toSwitchStateChip = (checked: boolean): StateChip =>
  checked ? SWITCH_STATE_CHIP.on : SWITCH_STATE_CHIP.off;

export const ALL_STATES_FILTER_ID = 'all';

const ALL_STATES_LABEL = 'Alle';
const STATE_FILTER_ORDER: readonly MembershipState[] = ['active', 'paused', 'ended', 'none'];

const NO_STATE_MATCH_LINES: Record<MembershipState, string> = {
  active: 'Gerade ist niemand aktives Mitglied.',
  paused: 'Gerade ruht keine Mitgliedschaft.',
  ended: 'Gerade hat niemand eine beendete Mitgliedschaft.',
  none: 'Gerade steht niemand ohne Mitgliedschaft in der Liste.',
};

export const toNoStateMatchLine = (state: string): string | null => {
  const known = STATE_FILTER_ORDER.find((entry) => entry === state);

  return known === undefined ? null : NO_STATE_MATCH_LINES[known];
};

const occurringStates = (counts: Record<MembershipState, number>): MembershipState[] =>
  STATE_FILTER_ORDER.filter((state) => counts[state] > 0);

export const toStateFilterOptions = (counts: Record<MembershipState, number>): KkFilterOption[] => {
  const total = STATE_FILTER_ORDER.reduce((sum, state) => sum + counts[state], 0);
  const offered = occurringStates(counts).map((state) => ({
    id: state,
    label: toMembershipStateLabel(state),
    count: counts[state],
  }));

  return [{ id: ALL_STATES_FILTER_ID, label: ALL_STATES_LABEL, count: total }, ...offered];
};

export type StateStatTone = 'default' | 'muted';

export interface StateStat {
  state: MembershipState;
  label: string;
  count: number;
  tone: StateStatTone;
}

export const toStateStats = (counts: Record<MembershipState, number>): StateStat[] =>
  occurringStates(counts).map((state) => ({
    state,
    label: toMembershipStateLabel(state),
    count: counts[state],
    tone: state === 'active' ? 'default' : 'muted',
  }));
