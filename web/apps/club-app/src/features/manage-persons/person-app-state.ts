import type { KkFilterOption } from '@furria/ui/filter-chip-entries';
import type { StateChip } from '@/lib/state-chips';
import type { PersonAccessFilter } from './person-access-filter';
import { parsePersonAccessFilter } from './person-access-filter';
import type { PersonSummary, RegisterAccessState } from './schemas';

const APP_STATE_CHIPS: Record<RegisterAccessState, StateChip | null> = {
  none: null,
  invited: { label: 'App eingeladen', tone: 'gold', dot: true },
  active: { label: 'App aktiv', tone: 'green', dot: true },
  disabled: { label: 'App gesperrt', tone: 'accent', dot: false },
  notInvitable: { label: 'nicht einladbar', tone: 'neutral', dot: false },
};

export const toAppStateChip = (state: RegisterAccessState): StateChip | null =>
  APP_STATE_CHIPS[state];

export const APP_FILTER_LABEL = 'App';
export const APP_FILTER_GROUP_LABEL = 'Nach App filtern';

export const APP_FILTER_OPTIONS: readonly KkFilterOption[] = [
  { id: 'none', label: 'nie eingeladen' },
  { id: 'invited', label: 'eingeladen' },
  { id: 'active', label: 'App aktiv' },
  { id: 'disabled', label: 'gesperrt' },
  { id: 'not-invitable', label: 'nicht einladbar' },
];

const NO_APP_FILTER_VALUE = '';

export const toAppFilterValue = (filter: PersonAccessFilter | null): string =>
  APP_FILTER_OPTIONS.find((option) => option.id === filter)?.id ?? NO_APP_FILTER_VALUE;

export const nextAppFilter = (
  current: PersonAccessFilter | null,
  chosenId: string,
): PersonAccessFilter | null => {
  const chosen = parsePersonAccessFilter(chosenId);

  return chosen === current ? null : chosen;
};

export type AppStatKey = 'active' | 'invited';

export interface AppStat {
  key: AppStatKey;
  label: string;
  count: number;
}

const APP_STAT_LABELS: Record<AppStatKey, string> = {
  active: 'mit App',
  invited: 'eingeladen',
};

const APP_STAT_ORDER: readonly AppStatKey[] = ['active', 'invited'];

export const toAppStats = (persons: readonly PersonSummary[]): AppStat[] =>
  APP_STAT_ORDER.map((key) => ({
    key,
    label: APP_STAT_LABELS[key],
    count: persons.filter((person) => person.accessState === key).length,
  })).filter((stat) => stat.count > 0);
