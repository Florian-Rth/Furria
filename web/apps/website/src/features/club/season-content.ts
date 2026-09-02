export const seasonChapter = {
  numeral: '03',
  kicker: 'WIE DIE SESSION LÄUFT',
  title: 'EINE SESSION',
} as const;

export const seasonIntro =
  'Eine Session ist unsere fünfte Jahreszeit: Sie beginnt am 11.11. und endet an Aschermittwoch — nach Vereinszeitrechnung dauert sie trotzdem vierzehn Monate. Fünf Etappen zwischen erstem Narrenruf und Kehraus.';

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
      'Punkt 11:11 Uhr rufen wir die neue Session aus. Seit Einführung der Vereinszeitzone UTC+11:11 ist das genau genommen jeder Zeitpunkt.',
  },
  {
    tag: 'Advent',
    title: 'Proben & Statik',
    description:
      'In der stillen Zeit wird umso lauter geübt. Parallel wird das Konfettilager im Keller neu vermessen und die Turnhalle für die Tanzgarde gedämmt.',
  },
  {
    tag: 'Februar',
    title: 'Prunksitzungen',
    description:
      'Bütt, Tanz und Show vor vollem Haus. Reden über elf Minuten kürzt die Reimprüfung, Küren unter elf Sekunden zeigen wir in Zeitlupe.',
  },
  {
    tag: 'Rosenmontag',
    title: 'Der Umzug',
    description:
      'Wir ziehen durch Großfurra — sofern der Wagen bis dahin eine Halle gefunden hat, in die er liegend passt. Kamelle fliegt bis ins Nachbardorf.',
  },
  {
    tag: 'Aschermittwoch',
    title: 'Der Ausklang',
    description:
      'Mit dem Kehraus endet die Session offiziell. Nach Vereinszeitrechnung ist bis zum nächsten 11.11. allerdings noch reichlich Luft.',
  },
];
