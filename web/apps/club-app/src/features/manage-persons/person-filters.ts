import type { KkLetterIndexEntry } from '@furria/ui';
import type { MembershipState } from '@/lib/api/schemas';
import { formatAddress } from '@/lib/membership-labels';
import { ALL_STATES_FILTER_ID } from '@/lib/state-chips';
import { normalizeForSearch, OTHER_INDEX_LETTER, toIndexLetter } from '@/lib/text';
import type { PersonSummary } from './schemas';

export interface PersonFilter {
  query: string;
  state: string;
}

export interface PersonLetterSection {
  letter: string;
  persons: PersonSummary[];
}

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const isPresent = (value: string | null): value is string => value !== null;

const toHaystacks = (person: PersonSummary): string[] =>
  [
    `${person.firstName} ${person.lastName}`,
    `${person.lastName} ${person.firstName}`,
    person.email,
    formatAddress(person.street, person.zip, person.city),
  ].filter(isPresent);

const matchesQuery = (person: PersonSummary, needle: string): boolean =>
  needle === '' ||
  toHaystacks(person).some((haystack) => normalizeForSearch(haystack).includes(needle));

const matchesState = (person: PersonSummary, state: string): boolean =>
  state === ALL_STATES_FILTER_ID || person.membershipState === state;

export const filterPersons = (
  persons: readonly PersonSummary[],
  { query, state }: PersonFilter,
): PersonSummary[] => {
  const needle = normalizeForSearch(query.trim());

  return persons.filter((person) => matchesQuery(person, needle) && matchesState(person, state));
};

export const countPersonsByState = (
  persons: readonly PersonSummary[],
): Record<MembershipState, number> => {
  const counts: Record<MembershipState, number> = { active: 0, paused: 0, ended: 0, none: 0 };

  for (const person of persons) {
    counts[person.membershipState] += 1;
  }

  return counts;
};

export const groupPersonsByLetter = (persons: readonly PersonSummary[]): PersonLetterSection[] => {
  const sections = new Map<string, PersonSummary[]>();

  for (const person of persons) {
    const letter = toIndexLetter(person.lastName);
    const known = sections.get(letter);

    if (known === undefined) {
      sections.set(letter, [person]);
    } else {
      known.push(person);
    }
  }

  return [...sections].map(([letter, sectionPersons]) => ({ letter, persons: sectionPersons }));
};

export const availablePersonLetters = (persons: readonly PersonSummary[]): KkLetterIndexEntry[] => {
  const present = new Set(persons.map((person) => toIndexLetter(person.lastName)));
  const letters = ALPHABET.map((letter) => ({ letter, enabled: present.has(letter) }));

  if (present.has(OTHER_INDEX_LETTER)) {
    letters.push({ letter: OTHER_INDEX_LETTER, enabled: true });
  }

  return letters;
};
