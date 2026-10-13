import type { KkAspect } from '@furria/ui/image-aspect';

export interface WebsitePage<P extends string = string> {
  key: P;
  title: string;
  path: string | null;
}

export interface PictureSlot<P extends string = string> {
  page: P;
  title: string;
  description: string;
  positions: readonly KkAspect[];
  decorative: boolean;
}

export const WEBSITE_PAGES = [
  { key: 'landing', title: 'Startseite', path: '/' },
  { key: 'club', title: 'Verein', path: '/club' },
  { key: 'events', title: 'Veranstaltungen', path: '/events' },
  { key: 'gallery', title: 'Galerie', path: '/gallery' },
  { key: 'join', title: 'Mitglied werden', path: '/join' },
  { key: 'site', title: 'Alle Seiten', path: null },
] as const satisfies readonly WebsitePage[];

export type WebsitePageKey = (typeof WEBSITE_PAGES)[number]['key'];

const FILMSTRIP_FRAMES = 8;

export const WEBSITE_PICTURE_SLOTS = {
  'landing.hero': {
    page: 'landing',
    title: 'Titelbild',
    description:
      'Großes Foto rechts neben der Überschrift der Startseite auf Tablet und Computer, leicht schräg gestellt, mit dem Datum der Saisoneröffnung in der oberen Ecke.',
    positions: ['landscape'],
    decorative: false,
  },
  'landing.heroPhone': {
    page: 'landing',
    title: 'Titelbild am Handy',
    description:
      'Füllt auf dem Handy den ganzen Kopf der Startseite hinter Logo und Überschrift. Die Schrift liegt auf dem unteren Teil des Fotos.',
    positions: ['portrait'],
    decorative: false,
  },
  'club.hero': {
    page: 'club',
    title: 'Kopfbild',
    description: 'Foto im Kopf der Vereinsseite neben der Überschrift, auf Tablet und Computer.',
    positions: ['landscape'],
    decorative: false,
  },
  'club.story': {
    page: 'club',
    title: 'Vereinsgeschichte',
    description: 'Foto neben dem Text zur Geschichte des Vereins.',
    positions: ['landscape'],
    decorative: false,
  },
  'events.filmstrip': {
    page: 'events',
    title: 'Filmstreifen',
    description: 'Acht Fotos als Filmstreifen im Kopf der Veranstaltungsseite.',
    positions: Array.from({ length: FILMSTRIP_FRAMES }, () => 'landscape' as const),
    decorative: true,
  },
  'gallery.stack': {
    page: 'gallery',
    title: 'Fotostapel',
    description:
      'Drei aufgefächerte Abzüge im Kopf der Galerie: vorne quer, dahinter hochkant und ganz hinten wieder quer.',
    positions: ['landscape', 'portrait', 'landscape'],
    decorative: false,
  },
  'join.hero': {
    page: 'join',
    title: 'Kopfbild',
    description:
      'Stimmungsbild im Kopf der Seite „Mitglied werden“ neben der Überschrift, auf Tablet und Computer.',
    positions: ['landscape'],
    decorative: true,
  },
  'site.shareImage': {
    page: 'site',
    title: 'Vorschaubild für geteilte Links',
    description:
      'Erscheint, wenn ein Link zur Website in WhatsApp, Signal oder anderswo geteilt wird und die Seite kein eigenes Bild hat.',
    positions: ['shareImage'],
    decorative: false,
  },
} as const satisfies Readonly<Record<string, PictureSlot<WebsitePageKey>>>;

export type PictureSlotKey = keyof typeof WEBSITE_PICTURE_SLOTS;
