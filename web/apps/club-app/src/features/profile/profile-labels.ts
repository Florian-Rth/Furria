import type { MemberContact } from '@/features/members';
import type { MePerson } from '@/lib/api/schemas';

export const PROFILE_SECTION_TITLES = {
  data: 'Deine Daten',
  membership: 'Mitgliedschaft',
  access: 'Zugang',
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
