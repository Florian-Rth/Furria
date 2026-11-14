import type { PageHeadInput } from './route-head';
import { pageTitle } from './route-head';

export const STATIC_PAGES = {
  home: {
    path: '/',
    title: 'Furrscher Carnevals Club e.V. · Karneval in Großfurra',
    description:
      'Der Furrscher Carnevals Club e.V. (FCC) – Karneval und Fasching in Großfurra seit 1971: Veranstaltungen, Karten, Neuigkeiten und der Weg in den Verein.',
  },
  club: {
    path: '/club',
    title: pageTitle('Verein'),
    description:
      'Der Furrscher Carnevals Club e.V. aus Großfurra — wer wir sind: unsere Geschichte, unsere Gruppen, die Menschen dahinter und der Weg in den Verein. Die fünfte Jahreszeit hat ein Zuhause.',
  },
  events: {
    path: '/events',
    title: pageTitle('Veranstaltungen'),
    description:
      'Alle Termine und Karten des FCC Großfurra — Prunksitzungen, Fasching und alle Veranstaltungen der Session im Überblick.',
  },
  news: {
    path: '/news',
    title: pageTitle('Aktuelles'),
    description:
      'Aktuelles vom Furrscher Carnevals Club e.V. aus Großfurra — Motto-Verkündung, Erfolge der Garden, Aufrufe zum Mitmachen und alles, was Großfurra zwischen den Veranstaltungen wissen sollte.',
  },
  gallery: {
    path: '/gallery',
    title: pageTitle('Galerie'),
    description:
      'Fotos vom Furrscher Carnevals Club e.V. — Sitzungen, Auftritte der Garden und Gruppen und die schönsten Momente jeder Session in Großfurra.',
  },
  join: {
    path: '/join',
    title: pageTitle('Mitglied werden'),
    description:
      'Mitglied im Furrscher Carnevals Club e.V. in Großfurra werden: was die Mitgliedschaft bedeutet, wo du hinpasst — und der Weg zum Beitrittsantrag. Du musst nicht tanzen können.',
  },
  joinApply: {
    path: '/join/apply',
    title: pageTitle('Beitrittsantrag'),
    description:
      'Beitrittsantrag für den Furrscher Carnevals Club e.V. in Großfurra: ein Formular, zwei Minuten. Die Mitgliedschaft ergibt sich aus dem Geburtsdatum.',
  },
  imprint: {
    path: '/imprint',
    title: pageTitle('Impressum'),
    description:
      'Impressum des Furrscher Carnevals Club e.V.: Anbieter, Kontakt und Verantwortliche für den Inhalt dieser Website.',
  },
  privacy: {
    path: '/privacy',
    title: pageTitle('Datenschutz'),
    description:
      'Datenschutzerklärung des Furrscher Carnevals Club e.V.: welche Daten die Website verarbeitet, wozu und welche Rechte du hast.',
  },
} as const satisfies Record<string, PageHeadInput>;
