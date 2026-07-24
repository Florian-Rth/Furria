export const seasonChapter = {
  numeral: '03',
  kicker: 'WIE DIE SESSION LÄUFT',
  title: 'EINE SESSION',
} as const;

export const seasonIntro =
  'Eine Session ist unsere fünfte Jahreszeit: Sie beginnt am 11.11. mit der Eröffnung und läuft bis Aschermittwoch. Fünf Etappen zwischen erstem Narrenruf und Kehraus.';

export interface SeasonStep {
  tag: string;
  title: string;
  description: string;
}

export const SEASON_STEPS: SeasonStep[] = [
  {
    tag: '11.11.',
    title: 'Die Eröffnung',
    description:
      'Punkt 11:11 Uhr rufen wir die neue Session aus — mit Ordensfest, Narrenruf und dem ersten Groß — Furria der Saison.',
  },
  {
    tag: 'Advent',
    title: 'Proben & Aufbau',
    description:
      'In der stillen Zeit wird umso lauter geübt: Garden, Ballett und Elferrat feilen an Tänzen, Reden und Kostümen.',
  },
  {
    tag: 'Februar',
    title: 'Prunksitzungen',
    description:
      'Der Höhepunkt im Saal: Bütt, Tanz und Showprogramm vor vollem Haus — die Wochen, auf die alles hinarbeitet.',
  },
  {
    tag: 'Rosenmontag',
    title: 'Der Umzug',
    description:
      'Wir ziehen durch Großbesenstadt — mit Wagen, Fußgruppen und Kamelle für die ganze Stadt am Straßenrand.',
  },
  {
    tag: 'Aschermittwoch',
    title: 'Der Ausklang',
    description:
      'Mit dem Kehraus endet die Session. Wir lassen es gemeinsam ausklingen — und freuen uns schon aufs nächste 11.11.',
  },
];
