import { formatLongDate } from '@/lib/date';
import { parseBirthDate } from './membership-derivation';
import type { MembershipApplicationForm } from './schemas';

const FALLBACK_INTRO = 'Der Antrag ließ sich auf der Website nicht absenden. Hier sind die Daten:';

const formatBirthDate = (birthDate: string): string =>
  parseBirthDate(birthDate) === null ? '' : formatLongDate(birthDate);

export const buildFallbackMailHref = (
  clubEmail: string,
  values: MembershipApplicationForm,
): string => {
  const entries: [string, string][] = [
    ['Vorname', values.firstName],
    ['Nachname', values.lastName],
    ['Geburtsdatum', formatBirthDate(values.birthDate)],
    ['Straße und Hausnummer', values.street],
    ['PLZ', values.postalCode],
    ['Ort', values.city],
    ['E-Mail', values.email],
    ['Telefon', values.phone],
    ['Satzung und Datenschutzhinweise gelesen', values.consent ? 'ja' : ''],
  ];

  const lines = entries
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`);

  const subject = `Beitrittsantrag – ${values.firstName} ${values.lastName}`.trim();
  const body = [FALLBACK_INTRO, '', ...lines].join('\n');

  return `mailto:${clubEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
