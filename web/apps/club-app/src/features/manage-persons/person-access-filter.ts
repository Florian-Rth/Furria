import { ALL_STATES_FILTER_ID } from '@/lib/state-chips';
import { toPersonsEmptyDescription } from './manage-persons-labels';

export const PERSON_ACCESS_FILTERS = [
  'none',
  'invited',
  'active',
  'disabled',
  'not-invitable',
] as const;

export type PersonAccessFilter = (typeof PERSON_ACCESS_FILTERS)[number];

const ACCESS_FILTER_LABELS: Record<PersonAccessFilter, string> = {
  none: 'noch nicht eingeladen',
  invited: 'eingeladen',
  active: 'mit Zugang',
  disabled: 'gesperrt',
  'not-invitable': 'nicht einladbar',
};

const NO_ACCESS_MATCH_LINES: Record<PersonAccessFilter, string> = {
  none: 'Wer einen Zugang haben kann, ist schon eingeladen oder hat einen.',
  invited: 'Gerade ist keine Einladung offen.',
  active: 'Noch hat niemand einen Zugang.',
  disabled: 'Kein Zugang ist gesperrt.',
  'not-invitable': 'Wer im Verein aktiv ist, kann auch eingeladen werden.',
};

export const ACCESS_FILTER_CLEAR_LABEL = 'Alle zeigen';

export const parsePersonAccessFilter = (value: string | undefined): PersonAccessFilter | null =>
  PERSON_ACCESS_FILTERS.find((filter) => filter === value?.trim().toLowerCase()) ?? null;

export const toAccessFilterNote = (filter: PersonAccessFilter): string =>
  `Nur Personen: ${ACCESS_FILTER_LABELS[filter]}`;

export const toNoAccessMatchLine = (filter: PersonAccessFilter): string =>
  NO_ACCESS_MATCH_LINES[filter];

export const toPersonsRequestPath = (filter: PersonAccessFilter | null): string =>
  filter === null
    ? '/api/manage/persons'
    : `/api/manage/persons?access=${encodeURIComponent(filter)}`;

export const toPersonsEmptyLine = (
  query: string,
  state: string,
  access: PersonAccessFilter | null,
): string =>
  access !== null && query.trim() === '' && state === ALL_STATES_FILTER_ID
    ? toNoAccessMatchLine(access)
    : toPersonsEmptyDescription(query, state);
