import type { Theme } from '@mui/material/styles';
import { FOUNDING_YEAR } from '@/lib/club';

export const chronicleChapter = {
  numeral: '02',
  kicker: 'WOHER WIR KOMMEN',
  title: 'DIE CHRONIK',
} as const;

export interface Milestone {
  year: string;
  title: string;
  description: string;
  isPlaceholder: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    year: String(FOUNDING_YEAR),
    title: 'Der erste Besen',
    description:
      'In Großfurra gründen elf Narren den Furrschen Carnevals Club. Überliefert ist der Beschluss — nicht, wer den Besen mitgebracht hat.',
    isPlaceholder: false,
  },
  {
    year: '1979',
    title: 'Die erste Garde',
    description:
      'Platzhalter — überliefert ist nur, dass die Kür damals noch in Echtzeit bewertet werden konnte.',
    isPlaceholder: true,
  },
  {
    year: '1988',
    title: 'Der Keller wird bezogen',
    description: 'Platzhalter — beim Einzug war er leer. Das ist der letzte Beleg dafür.',
    isPlaceholder: true,
  },
  {
    year: '2004',
    title: 'Der große Umzug',
    description: 'Platzhalter — der Wagen passte damals noch unter die Brücke in der Marktstraße.',
    isPlaceholder: true,
  },
  {
    year: '2021',
    title: '50 Jahre, elf Tage',
    description: 'Platzhalter — gefeiert wurde elf Tage lang, protokolliert wurde davon nichts.',
    isPlaceholder: true,
  },
];

export const resolveMilestoneTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  if (index === 0) {
    return palette.primary.main;
  }
  return palette.warning.main;
};
