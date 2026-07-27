import type { Theme } from '@mui/material/styles';

export const peopleChapter = {
  numeral: '05',
  kicker: 'WER FURRIA ZUSAMMENHÄLT',
  title: 'MENSCHEN, DIE FURRIA SIND',
} as const;

export interface Person {
  amt: string;
  name: string;
}

export const PEOPLE: Person[] = [
  { amt: 'Präsident auf Lebenszeit', name: 'Otto von Bismarck' },
  { amt: 'Hofkomponist', name: 'Ludwig van Beethoven' },
  { amt: 'Oberste Reimprüferin', name: 'Clara Schumann' },
  { amt: 'Beauftragter für Höhenflüge', name: 'Alexander von Humboldt' },
  { amt: 'Kamelle-Statistiker', name: 'Carl Friedrich Gauß' },
  { amt: 'Äbtissin für gute Laune', name: 'Hildegard von Bingen' },
];

export const personPhotoCaption = 'portrait';

export const resolvePersonTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints = [palette.primary.main, palette.warning.main, palette.text.primary];
  return tints[index % tints.length] ?? palette.primary.main;
};
