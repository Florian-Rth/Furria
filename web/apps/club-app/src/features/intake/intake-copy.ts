import type { KkBannerDeskLabels } from '@furria/ui/banner-desk-types';
import { PICTURE_DESK_LABELS } from '@/features/pictures/picture-labels';

export const PAGE_TITLE = 'Deine Angaben';
export const ABOUT_SECTION = 'Über dich';
export const ADDRESS_SECTION = 'Anschrift';
export const CONTACT_SECTION = 'Kontakt';
export const PORTRAIT_SECTION = 'Porträt';
export const FIRST_NAME_LABEL = 'Vorname';
export const LAST_NAME_LABEL = 'Nachname';
export const BIRTH_DATE_LABEL = 'Geburtsdatum';
export const STREET_LABEL = 'Straße und Hausnummer';
export const ZIP_LABEL = 'PLZ';
export const CITY_LABEL = 'Ort';
export const EMAIL_LABEL = 'E-Mail';
export const EMAIL_HINT = 'Für deinen Zugang zur App';
export const PHONE_LABEL = 'Telefon';
export const VISIBILITY_LABEL = 'Meine Kontaktdaten für Mitglieder sichtbar';
export const SUBMIT_LABEL = 'Absenden';
export const PORTRAIT_ALT = 'Dein Porträt';
export const UNPREVIEWABLE_LINE = 'Foto gewählt – dein Browser kann davon keine Vorschau zeigen.';
export const PORTRAIT_DESK_ID = 'intake-portrait';

export const PORTRAIT_LABELS: KkBannerDeskLabels = {
  ...PICTURE_DESK_LABELS.portrait,
  upload: 'Foto wählen',
  replace: 'Anderes Foto',
};

export const uploadLineOf = (share: number): string =>
  `Porträt wird hochgeladen · ${Math.round(share * 100)} %`;

export const DONE_TITLE = 'DANKE!';
export const DONE_LINE = 'Deine Angaben sind angekommen.';
export const SET_UP_APP_LABEL = 'App jetzt einrichten';

export const CLOSED_TITLES = {
  expired: 'DIESER LINK IST ABGELAUFEN',
  used: 'DU HAST DICH SCHON EINGETRAGEN',
  discarded: 'DIESER LINK GILT NICHT MEHR',
  unknown: 'DIESEN LINK GIBT ES NICHT',
  missing: 'HIER FEHLT DER LINK',
} as const;

export const CLOSED_LINES = {
  expired: 'Frag nach einem neuen Link.',
  used: 'Jeder Link gilt nur einmal.',
  discarded: 'Frag nach einem neuen Link.',
  unknown: 'Scanne den QR-Code noch einmal oder öffne den Link aus der Nachricht.',
  missing: 'Öffne den Link vollständig, mit allem nach dem #.',
} as const;

export type IntakeClosedReason = keyof typeof CLOSED_TITLES;
