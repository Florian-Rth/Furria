import type { MembershipState } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import type { StateChip } from '@/lib/state-chips';
import { toMembershipStateChip, toNoStateMatchLine } from '@/lib/state-chips';
import type { LetterAnchor } from '@/lib/use-letter-position';
import type { MemberDetails } from './schemas';

const META_SEPARATOR = ' · ';
const LETTER_ANCHOR_PREFIX = 'letter-';
const OTHER_LETTER_ANCHOR = `${LETTER_ANCHOR_PREFIX}other`;
const LATIN_LETTER = /^[A-Z]$/;

export const toLetterAnchorId = (letter: string): string =>
  LATIN_LETTER.test(letter)
    ? `${LETTER_ANCHOR_PREFIX}${letter.toLowerCase()}`
    : OTHER_LETTER_ANCHOR;

export const toLetterAnchors = (sections: readonly { letter: string }[]): LetterAnchor[] =>
  sections.map((section) => ({
    letter: section.letter,
    anchorId: toLetterAnchorId(section.letter),
  }));

export const LETTER_INDEX_LABEL = 'Zu einem Buchstaben springen';

export const MEMBERS_LEAD = 'Kontakte, Gruppen und Rollen aller Personen im Verein.';
export const toWithoutMembershipSentence = (count: number): string | null => {
  if (count === 0) {
    return null;
  }
  if (count === 1) {
    return 'Darunter 1 Person ohne Mitgliedschaft.';
  }

  return `Darunter ${count} Personen ohne Mitgliedschaft.`;
};

const COUNTING_FOOTNOTE = 'Gezählt werden alle, die aktuell mit dem FCC verbunden sind.';
const ALL_FILTER_SUGGESTION = 'Wähle „Alle“, um alle anzuzeigen.';

export const toStatsFootnote = (withoutMembership: number): string =>
  toWithoutMembershipSentence(withoutMembership) ?? COUNTING_FOOTNOTE;

export type MembersEmptyCause =
  | { kind: 'query'; needle: string }
  | { kind: 'filtered'; stateLine: string }
  | { kind: 'empty' };

export const membersEmptyCauseOf = (query: string, state: string): MembersEmptyCause => {
  const needle = query.trim();

  if (needle !== '') {
    return { kind: 'query', needle };
  }

  const stateLine = toNoStateMatchLine(state);

  return stateLine === null ? { kind: 'empty' } : { kind: 'filtered', stateLine };
};

export const toEmptyDescription = (query: string, state: string): string => {
  const cause = membersEmptyCauseOf(query, state);

  if (cause.kind === 'query') {
    return `Keine Treffer für „${cause.needle}“.`;
  }
  if (cause.kind === 'empty') {
    return 'Keine Einträge.';
  }

  return `${cause.stateLine} ${ALL_FILTER_SUGGESTION}`;
};

export interface MemberHeadline {
  title: string;
  initials: string;
  state: StateChip | null;
}

export const MEMBER_PEEK_CLOSE_LABEL = 'Kurzansicht schließen';
export const MEMBER_PEEK_OPEN_LABEL = 'Ganze Seite öffnen';
export const MEMBER_PEEK_EMPTY_VALUE = 'keine';

export const toPeekAffiliationLine = (entries: readonly { name: string }[]): string | null =>
  entries.length === 0 ? null : entries.map((entry) => entry.name).join(META_SEPARATOR);

export const MEMBER_SECTION_TITLES = {
  groups: 'Gruppen',
  roles: 'Rollen',
  club: 'Im Verein',
  contact: 'Kontakt',
} as const;

const MEMBER_TITLE_FALLBACK = 'Person';

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
    return `${firstName} ist in einer Ruhezeit und gilt nicht als aktiv.`;
  }
  if (state === 'ended') {
    return `Die Mitgliedschaft ist beendet, ${firstName} bleibt aber mit dem FCC verbunden.`;
  }

  return `${firstName} wirkt im Verein mit, ohne Mitglied zu sein.`;
};

export const toContactHiddenExplanation = (firstName: string): string =>
  `${firstName} hat die Kontaktdaten nicht für Mitglieder freigegeben.`;

export const SELF_CONTACT_HIDDEN_EXPLANATION =
  'Deine Kontaktdaten sind für Mitglieder nicht freigegeben.';

export const SELF_CONTACT_HIDDEN_LINK = 'In Mein Profil ändern';

export const toNoGroupsDescription = (firstName: string): string =>
  `${firstName} ist in keiner Gruppe.`;

export const toNoRolesDescription = (firstName: string): string =>
  `${firstName} hat keine Rolle im Verein.`;
