export const PROMO_LABEL = 'FURRIA – die App und die Website';
export const PROMO_WORDMARK = 'FURRIA';
export const PROMO_CLUB_NAME = 'Furrscher Carnevals Club e.V.';
export const sessionMetaOf = (yearsLabel: string): string => `Session ${yearsLabel}`;

export const PROMO_TICKER = [
  'Termine',
  'Auftritte',
  'Tanzstudio',
  'Bierliste',
  'Galerie',
  'News',
  'Website',
] as const;
export const arrivalTickerOf = (names: readonly string[]): string[] => [
  'Neu in der App',
  ...names,
  'Herzlich willkommen',
];

export const PROMO_INDEX = [
  'Start',
  'Kalender',
  'Sitzung',
  'Tanz',
  'Galerie',
  'Website',
  'Bierliste',
] as const;

export const PROMO_QR_CALL = 'Jetzt registrieren';
export const PROMO_ARRIVAL_LABELS = {
  kicker: 'Neu in der App',
  welcome: 'Herzlich willkommen',
  sealLabel: 'Neu',
  sealCaption: 'in der App',
} as const;
export const moreNamesOf = (more: number): string | null =>
  more > 0 ? `und ${more} weitere` : null;

export const OPENER_COPY = { line2: 'Die neue Vereins-App.' } as const;
export const openerLineOf = (yearsLabel: string): string => `Session ${yearsLabel}.`;

export const START_COPY = {
  kicker: 'Start',
  line1: 'Der Verein.',
  line2: 'In einer App.',
  lead: 'Termine, Gruppen, Auftritte und Mitteilungen – an einem Ort für alle Mitglieder.',
} as const;
export const CALENDAR_COPY = {
  kicker: 'Kalender',
  line1: 'Alle Termine.',
  line2: 'Immer aktuell.',
  lead: 'Trainings, Sitzungen und Veranstaltungen deiner Gruppen. Zu- und Absagen direkt in der App.',
} as const;
export const EVENT_COPY = {
  kicker: 'Sitzung',
  line1: 'Ablauf und Saalplan.',
  line2: 'Zentral geplant.',
  lead: 'Programmablauf, Auftritte und Bestuhlung jeder Veranstaltung an einer Stelle.',
} as const;
export const DANCE_COPY = {
  kicker: 'Tanz',
  line1: 'Choreografien.',
  line2: 'Jederzeit zur Hand.',
  lead: 'Musik, Video und Schrittfolge jedes Auftritts – für das Training und für zu Hause.',
} as const;
export const BEER_COPY = {
  kicker: 'Bierliste',
  line1: 'Die Bierliste.',
  line2: 'Digital geführt.',
  lead: 'Kisten buchen, Kontostand einsehen und transparent abrechnen.',
} as const;
export const GALLERY_COPY = {
  kicker: 'Galerie',
  line1: 'Fotos und News.',
  line2: 'Aus erster Hand.',
  lead: 'Bilder der Veranstaltungen und Mitteilungen des Vereins – direkt auf dem Smartphone.',
  placeholder: 'Foto folgt',
} as const;
export const WEBSITE_COPY = {
  kicker: 'Website',
  line1: 'Die neue Website.',
  line2: 'Für alle Gäste.',
  lead: 'Veranstaltungen, Vorverkaufsstellen und Mitgliedsantrag für alle Interessierten.',
} as const;
export const FINALE_COPY = {
  line1: 'Schon dabei.',
  line2: 'Jetzt registrieren.',
  lead: 'QR-Code scannen, die beim Verein hinterlegte E-Mail-Adresse eingeben und den Link in der Mail öffnen.',
} as const;

export const WEBSITE_ADDRESS = 'furria.florianrth.com';

export const SCREEN_TITLES = {
  start: 'Start der App',
  calendar: 'Kalender der App',
  event: 'Ablauf der Sitzung',
  tablePlan: 'Saalplan der Sitzung',
  act: 'Auftritt in der App',
  training: 'Training in der App',
  beer: 'Bierliste der App',
  news: 'News der App',
  website: 'Startseite der Website',
  websiteEvents: 'Termine auf der Website',
} as const;
