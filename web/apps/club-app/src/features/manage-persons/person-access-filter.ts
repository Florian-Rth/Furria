import type { StateChip } from '@/lib/state-chips';
import { ALL_STATES_FILTER_ID, toMembershipStateChip } from '@/lib/state-chips';
import { toPersonsEmptyDescription } from './manage-persons-labels';
import type { PersonSummary, RegisterAccessState } from './schemas';

export const PERSON_ACCESS_FILTERS = [
  'none',
  'invited',
  'active',
  'disabled',
  'not-invitable',
  'with-access',
  'open-invitation',
  'without-email',
  'birth-date-unknown',
] as const;

export type PersonAccessFilter = (typeof PERSON_ACCESS_FILTERS)[number];

const ACCESS_FILTER_LABELS: Record<PersonAccessFilter, string> = {
  none: 'noch nicht eingeladen',
  invited: 'eingeladen',
  active: 'mit aktivem Account',
  disabled: 'gesperrt',
  'not-invitable': 'nicht einladbar',
  'with-access': 'mit Zugang',
  'open-invitation': 'mit offener Einladung',
  'without-email': 'ohne E-Mail-Adresse, nur vor Ort einladbar',
  'birth-date-unknown': 'ohne Geburtsdatum',
};

const NO_ACCESS_MATCH_LINES: Record<PersonAccessFilter, string> = {
  none: 'Wer einen Zugang haben kann, ist schon eingeladen oder hat einen.',
  invited: 'Gerade ist keine Einladung offen.',
  active: 'Noch hat niemand einen aktiven Account.',
  disabled: 'Kein Zugang ist gesperrt.',
  'not-invitable': 'Wer im Verein aktiv ist, kann auch eingeladen werden.',
  'with-access': 'Noch hat niemand aus dem Verein einen Zugang.',
  'open-invitation': 'Gerade ist keine Einladung offen.',
  'without-email': 'Alle Einladbaren haben eine E-Mail-Adresse.',
  'birth-date-unknown':
    'Bei allen ohne Zugang ist das Geburtsdatum hinterlegt oder eine Einladung offen.',
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

const REGISTER_ACCESS_CHIPS: Record<RegisterAccessState, StateChip> = {
  none: { label: 'kein Zugang', tone: 'neutral', dot: false },
  invited: { label: 'eingeladen', tone: 'gold', dot: true },
  active: { label: 'Account aktiv', tone: 'green', dot: true },
  disabled: { label: 'gesperrt', tone: 'accent', dot: false },
  notInvitable: { label: 'nicht einladbar', tone: 'neutral', dot: false },
};

export const toRegisterAccessChip = (state: RegisterAccessState): StateChip =>
  REGISTER_ACCESS_CHIPS[state];

export const toPersonRowChip = (
  person: PersonSummary,
  access: PersonAccessFilter | null,
): StateChip =>
  access === null
    ? toMembershipStateChip(person.membershipState)
    : toRegisterAccessChip(person.accessState);
