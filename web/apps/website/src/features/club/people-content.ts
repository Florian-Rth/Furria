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
  { amt: 'Präsident', name: 'Franz-Josef Besen' },
  { amt: 'Präsidentin', name: 'Marlies Furrmann' },
  { amt: 'Kinderpräsidentin', name: 'Lena Kehr' },
  { amt: 'Geschäftsführer', name: 'Bernd Groß' },
  { amt: 'Getränkewart', name: 'Uwe Fass' },
  { amt: 'Trainerin', name: 'Sabine Wirbel' },
];

export const personPhotoCaption = 'portrait';

export const resolvePersonTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints = [palette.primary.main, palette.warning.main, palette.text.primary];
  return tints[index % tints.length] ?? palette.primary.main;
};
