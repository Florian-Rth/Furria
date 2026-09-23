import type { MemberContact } from '@/features/members';
import type { Me, MePerson } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import type { StateChip } from '@/lib/state-chips';
import { toMembershipStateChip } from '@/lib/state-chips';

export const PROFILE_EYEBROW = 'Mein Profil';

const PROFILE_TITLE_FALLBACK = 'Profil';

export interface ProfileHeadline {
  title: string;
  initials: string;
  state: StateChip | null;
}

export const toProfileHeadline = (me: Me | undefined): ProfileHeadline => {
  if (me === undefined) {
    return { title: PROFILE_TITLE_FALLBACK, initials: '', state: null };
  }

  return {
    title: `${me.person.firstName} ${me.person.lastName}`,
    initials: toInitials(me.person.firstName, me.person.lastName),
    state: toMembershipStateChip(me.membership.state),
  };
};

export const VISIBILITY_SWITCH_LABEL = 'Meine Kontaktdaten für Mitglieder sichtbar';

export const VISIBILITY_EXPLANATION =
  'Wenn aktiviert, sehen Mitglieder im Verzeichnis deine Telefonnummer, E-Mail und Adresse. Andernfalls erscheint dort ein Hinweis, dass sie nicht freigegeben sind.';

export const VISIBILITY_KEY_HOLDER_NOTE =
  'Mit dem Recht „Kontaktdaten aller Personen sehen“ sind deine Daten immer sichtbar.';

export const VISIBILITY_OFF_NOTE = 'Das gilt auch für deine Gruppen-Admins.';

export const VISIBILITY_PREVIEW_CAPTION = 'So sehen andere Mitglieder deinen Kontakt.';

export const PROFILE_SECTION_TITLES = {
  data: 'Deine Daten',
  membership: 'Im Verein',
  groups: 'Deine Gruppen',
  visibility: 'Sichtbarkeit',
  preview: 'Was andere von dir sehen',
} as const;

export const toPreviewContact = (person: MePerson, visible: boolean): MemberContact => {
  if (!visible) {
    return { visibility: 'hidden', phone: null, email: null, street: null, zip: null, city: null };
  }

  return {
    visibility: 'shared',
    phone: person.phone,
    email: person.email,
    street: person.street,
    zip: person.zip,
    city: person.city,
  };
};

export const toVisibilitySavedMessage = (visible: boolean): string =>
  visible
    ? 'Deine Kontaktdaten sind jetzt für Mitglieder sichtbar.'
    : 'Deine Kontaktdaten sind wieder verborgen.';
