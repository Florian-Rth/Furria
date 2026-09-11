import type { GroupRef, RoleRef } from '@/lib/api/schemas';

export interface PersonRowAffiliation {
  accent?: string;
  meta?: string;
}

const META_SEPARATOR = ' · ';
const LETTER_ANCHOR_PREFIX = 'letter-';
const OTHER_LETTER_ANCHOR = `${LETTER_ANCHOR_PREFIX}other`;
const LATIN_LETTER = /^[A-Z]$/;

const toAccent = (roles: readonly RoleRef[]): string | undefined => {
  const [first, ...further] = roles;

  if (first === undefined) {
    return undefined;
  }
  if (further.length === 0) {
    return first.name;
  }

  return `${first.name} +${further.length}`;
};

const toMeta = (groups: readonly GroupRef[]): string | undefined => {
  if (groups.length === 0) {
    return undefined;
  }

  return groups.map((group) => group.name).join(META_SEPARATOR);
};

export const toPersonRowAffiliation = (
  groups: readonly GroupRef[],
  roles: readonly RoleRef[],
): PersonRowAffiliation => ({ accent: toAccent(roles), meta: toMeta(groups) });

export const toLetterAnchorId = (letter: string): string =>
  LATIN_LETTER.test(letter)
    ? `${LETTER_ANCHOR_PREFIX}${letter.toLowerCase()}`
    : OTHER_LETTER_ANCHOR;

export const toConnectedSentence = (count: number): string => {
  const people = count === 1 ? '1 Person ist' : `${count} Personen sind`;

  return `${people} aktuell mit dem FCC verbunden. Alles hier ist Ansicht — geändert wird in der Personenverwaltung.`;
};

export const toWithoutMembershipSentence = (count: number): string | null => {
  if (count === 0) {
    return null;
  }
  if (count === 1) {
    return '1 Person tanzt oder hilft mit, ohne Mitglied zu sein. Sie steht mit in der Liste.';
  }

  return `${count} Personen tanzen oder helfen mit, ohne Mitglied zu sein. Sie stehen mit in der Liste.`;
};

export const toEmptyDescription = (query: string): string => {
  const needle = query.trim();

  if (needle === '') {
    return 'Zu diesem Filter passt gerade niemand. Wähle „Alle“, um wieder alle zu sehen.';
  }

  return `Kein Name, keine Gruppe und keine Rolle passt zu „${needle}“. Vielleicht anders geschrieben?`;
};
