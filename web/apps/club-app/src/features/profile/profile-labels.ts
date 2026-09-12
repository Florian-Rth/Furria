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
