import type { GroupRef, MembershipState, RoleRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import type { StateChip } from '@/lib/state-chips';
import { toMembershipStateChip } from '@/lib/state-chips';
import type { MemberDetails } from './schemas';

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

export interface MemberHeadline {
  title: string;
  initials: string;
  state: StateChip | null;
}

export const MEMBER_SECTION_TITLES = {
  groups: 'Gruppen',
  roles: 'Rollen',
  club: 'Im Verein',
  contact: 'Kontakt',
} as const;

const MEMBER_TITLE_FALLBACK = 'Person';
const PERSON_ID_PATTERN = /^[1-9]\d*$/;

export const toPersonId = (raw: string): number | null =>
  PERSON_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toMemberHeadline = (member: MemberDetails | undefined): MemberHeadline => {
  if (member === undefined) {
    return { title: MEMBER_TITLE_FALLBACK, initials: '', state: null };
  }

  return {
    title: `${member.firstName} ${member.lastName}`,
    initials: toInitials(member.firstName, member.lastName),
    state: toMembershipStateChip(member.membershipState),
  };
};

export const toMembershipNote = (state: MembershipState, firstName: string): string | null => {
  if (state === 'active') {
    return null;
  }
  if (state === 'paused') {
    return `In einer Ruhezeit zählt ${firstName} nicht als aktiv. Die Gruppen bleiben bestehen.`;
  }
  if (state === 'ended') {
    return `Die Mitgliedschaft ist beendet. ${firstName} ist weiter mit dem FCC verbunden.`;
  }

  return `${firstName} tanzt oder hilft mit, ohne Mitglied zu sein.`;
};

export const toContactHiddenExplanation = (firstName: string): string =>
  `${firstName} hat die Anzeige für Mitglieder ausgeschaltet. Das ist eine Einstellung, keine Lücke — frag im Zweifel eine Gruppen-Admin.`;

export const toNoGroupsDescription = (firstName: string): string =>
  `${firstName} tanzt und spielt gerade in keiner Gruppe mit.`;

export const toNoRolesDescription = (firstName: string): string =>
  `${firstName} trägt gerade keine Rolle im Verein.`;
