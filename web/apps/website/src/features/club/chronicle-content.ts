import type { Theme } from '@mui/material/styles';

export const chronicleChapter = {
  numeral: '02',
  kicker: 'WOHER WIR KOMMEN',
  title: 'DIE CHRONIK',
} as const;

export interface Milestone {
  dateLabel: string;
  title: string;
  description: string;
  quote: string | null;
}

const peopleCall = '„Leute, Leute, Leute“';

export const MILESTONES: Milestone[] = [
  {
    dateLabel: '24.02.1971',
    title: 'Die Idee',
    description:
      'Aschermittwoch, für Karnevalisten sonst ein grauer Tag. Für Großfurras Narrenvolk wird er ein neuer Anfang: Dieter Röhl geht mit seiner Idee zu Otto Teichmann. Es folgen Beratungen über Beratungen – Finanzen, Kostüme, Technik, Programm, Garde, Kapellen und vor allem:',
    quote: peopleCall,
  },
  {
    dateLabel: '11.11.1971',
    title: 'Die erste Eröffnung',
    description:
      'Dann ist es so weit: Auf dem Schützenplatz wird die Saison eröffnet – mit allen Helfern. Nach den vielen Beratungen hatten die sich das redlich verdient.',
    quote: null,
  },
  {
    dateLabel: '27.11.1971',
    title: 'Große Prunksitzung',
    description:
      'Nach elfjähriger Pause findet der Furrsche Fasching zum fünften Mal statt: um 20:11 Uhr in der Sporthalle, Musik vom Nobas-Quintett. Angekündigt wird er im Schaufenster bei Frl. Ernst – und laut Chronik lasen ihn begeistert alle Großbesenstädter. Eine Reichweite, von der man heute nur träumen kann.',
    quote: null,
  },
  {
    dateLabel: '1977',
    title: 'Die Chronik beginnt',
    description:
      'Seit dieser Session hält die Vereinschronik fest, was jedes Jahr auf die Bühne kam: Motto, Programm, Bühnenbild. Sie ist das Gedächtnis des Vereins – auch für Abende, an die sich manche nur noch ungefähr erinnern.',
    quote: null,
  },
  {
    dateLabel: '2071',
    title: '100 Jahre FCC',
    description:
      'Die Planungen laufen. Beratungen über Beratungen haben bereits begonnen – Finanzen, Kostüme, Technik und vor allem:',
    quote: peopleCall,
  },
];

export const resolveMilestoneTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  if (index === 0) {
    return palette.primary.main;
  }
  return palette.warning.main;
};
