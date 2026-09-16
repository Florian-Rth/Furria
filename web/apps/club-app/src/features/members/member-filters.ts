import type { KkLetterIndexEntry } from '@furria/ui';
import type { MembershipState } from '@/lib/api/schemas';
import { ALL_STATES_FILTER_ID } from '@/lib/state-chips';
import { normalizeForSearch, OTHER_INDEX_LETTER, toIndexLetter } from '@/lib/text';
import type { MemberSummary } from './schemas';

export interface MemberFilter {
  query: string;
  state: string;
}

export interface MemberLetterSection {
  letter: string;
  members: MemberSummary[];
}

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const toHaystacks = (member: MemberSummary): string[] => [
  `${member.firstName} ${member.lastName}`,
  `${member.lastName} ${member.firstName}`,
  ...member.groups.map((group) => group.name),
  ...member.roles.map((role) => role.name),
];

const matchesQuery = (member: MemberSummary, needle: string): boolean =>
  needle === '' ||
  toHaystacks(member).some((haystack) => normalizeForSearch(haystack).includes(needle));

const matchesState = (member: MemberSummary, state: string): boolean =>
  state === ALL_STATES_FILTER_ID || member.membershipState === state;

export const filterMembers = (
  members: readonly MemberSummary[],
  { query, state }: MemberFilter,
): MemberSummary[] => {
  const needle = normalizeForSearch(query.trim());

  return members.filter((member) => matchesQuery(member, needle) && matchesState(member, state));
};

export const countByState = (
  members: readonly MemberSummary[],
): Record<MembershipState, number> => {
  const counts: Record<MembershipState, number> = { active: 0, paused: 0, ended: 0, none: 0 };

  for (const member of members) {
    counts[member.membershipState] += 1;
  }

  return counts;
};

export const groupByLetter = (members: readonly MemberSummary[]): MemberLetterSection[] => {
  const sections = new Map<string, MemberSummary[]>();

  for (const member of members) {
    const letter = toIndexLetter(member.lastName);
    const known = sections.get(letter);

    if (known === undefined) {
      sections.set(letter, [member]);
    } else {
      known.push(member);
    }
  }

  return [...sections].map(([letter, sectionMembers]) => ({ letter, members: sectionMembers }));
};

export const availableLetters = (members: readonly MemberSummary[]): KkLetterIndexEntry[] => {
  const present = new Set(members.map((member) => toIndexLetter(member.lastName)));
  const letters = ALPHABET.map((letter) => ({ letter, enabled: present.has(letter) }));

  if (present.has(OTHER_INDEX_LETTER)) {
    letters.push({ letter: OTHER_INDEX_LETTER, enabled: true });
  }

  return letters;
};
