import type { PageHeadInput } from './route-head';
import { pageTitle } from './route-head';

export const STATIC_PAGES = {
  home: {
    path: '/',
    title: 'FURRIA · Gross - Furria!',
    description:
      'Der Furrsche Carnevals Club e.V. feiert die fünfte Jahreszeit in Großfurra: Veranstaltungen, Karten, Neuigkeiten und der Weg in den Verein. Gross - Furria!',
  },
  club: {
    path: '/club',
    title: pageTitle('Verein'),
    description:
      'Der Furrsche Carnevals Club e.V. — wer wir sind: unsere Geschichte, unsere Gruppen, die Menschen dahinter und der Weg in den Verein. Die fünfte Jahreszeit hat ein Zuhause.',
  },
  events: {
    path: '/events',
    title: pageTitle('Veranstaltungen'),
    description:
      'Alle Termine und Karten des Furrschen Carnevals Club e.V. — die Veranstaltungen der Session im Überblick.',
  },
  news: {
    path: '/news',
    title: pageTitle('Aktuelles'),
    description:
      'Aktuelles vom Furrschen Carnevals Club e.V. — Motto-Verkündung, Erfolge der Garden, Aufrufe zum Mitmachen und alles, was Großfurra zwischen den Veranstaltungen wissen sollte.',
  },
  gallery: {
    path: '/gallery',
    title: pageTitle('Galerie'),
    description:
      'Fotos vom Furrschen Carnevals Club e.V. — Sitzungen, Auftritte der Garden und Gruppen und die schönsten Momente jeder Session in Großfurra.',
  },
  join: {
    path: '/join',
    title: pageTitle('Mitglied werden'),
    description:
      'Mitglied im Furrschen Carnevals Club e.V. werden: was die Mitgliedschaft kostet, was sie bedeutet, wo du hinpasst — und der Weg zum Beitrittsantrag. Du musst nicht tanzen können.',
  },
  joinApply: {
    path: '/join/apply',
    title: pageTitle('Beitrittsantrag'),
    description:
      'Beitrittsantrag für den Furrschen Carnevals Club e.V.: ein Formular, zwei Minuten. Mitgliedschaft und Beitrag ergeben sich aus dem Geburtsdatum, jetzt wird nichts abgebucht.',
  },
  imprint: {
    path: '/imprint',
    title: pageTitle('Impressum'),
    description:
      'Impressum des Furrschen Carnevals Club e.V.: Anbieter, Kontakt und Verantwortliche für den Inhalt dieser Website.',
  },
  privacy: {
    path: '/privacy',
    title: pageTitle('Datenschutz'),
    description:
      'Datenschutzerklärung des Furrschen Carnevals Club e.V.: welche Daten die Website verarbeitet, wozu und welche Rechte du hast.',
  },
} as const satisfies Record<string, PageHeadInput>;
