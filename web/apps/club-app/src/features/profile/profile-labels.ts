import type { KkColorSchemeChoice } from '@furria/ui/color-scheme-switch-types';
import type { ContactChange, MePerson, PersonalMe } from '@/lib/api/schemas';
import { toContactChangeLine } from '@/lib/contact-change';
import { toInitials } from '@/lib/initials';
import type { StateChip } from '@/lib/state-chips';
import { toMembershipStateChip } from '@/lib/state-chips';
import type { ContactDetailsForm } from './schemas';

export const PROFILE_EYEBROW = 'Mein Profil';

const PROFILE_TITLE_FALLBACK = 'Profil';

export interface ProfileHeadline {
  title: string;
  initials: string;
  state: StateChip | null;
}

export const toProfileHeadline = (me: PersonalMe | undefined): ProfileHeadline => {
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

export const VISIBILITY_OFF_NOTE = 'Das gilt auch für deine Gruppen-Admins.';

export const PROFILE_SECTION_TITLES = {
  contact: 'Kontaktdaten',
  data: 'Deine Daten',
  membership: 'Im Verein',
  groups: 'Deine Gruppen',
  visibility: 'Sichtbarkeit',
  signIn: 'Anmeldung',
  appearance: 'Darstellung',
} as const;

export const APPEARANCE_LABEL = 'Darstellung der App';

export const APPEARANCE_CHOICES: readonly KkColorSchemeChoice[] = [
  { mode: 'light', label: 'Hell' },
  { mode: 'dark', label: 'Dunkel' },
  { mode: 'system', label: 'Automatisch' },
];

export const toVisibilitySavedMessage = (visible: boolean): string =>
  visible
    ? 'Deine Kontaktdaten sind jetzt für Mitglieder sichtbar.'
    : 'Deine Kontaktdaten sind wieder verborgen.';

export const CONTACT_DETAILS_EDIT_TITLE = 'Kontaktdaten bearbeiten';

export const CONTACT_DETAILS_SAVED_MESSAGE = 'Deine Kontaktdaten sind gespeichert.';

export const CONTACT_DETAILS_LANDING = { kind: 'profile', id: 'contact' } as const;

export const toContactDetailsForm = (person: MePerson): ContactDetailsForm => ({
  email: person.email ?? '',
  phone: person.phone ?? '',
  street: person.street ?? '',
  zip: person.zip ?? '',
  city: person.city ?? '',
});

export const toOwnContactChangeNote = (
  change: ContactChange | null,
  personId: number,
  today: Date,
): string | undefined =>
  change === null ? undefined : `Zuletzt ${toContactChangeLine(change, personId, today)}`;
