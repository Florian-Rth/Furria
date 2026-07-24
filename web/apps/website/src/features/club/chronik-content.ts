import type { Theme } from '@mui/material/styles';
import { FOUNDING_YEAR } from '@/lib/club';

export const chronikChapter = {
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
      'In Großbesenstadt gründen ein paar Narren den Furrschen Carnevals Club — der Grundstein für alles, was folgt.',
    isPlaceholder: false,
  },
  {
    year: '1979',
    title: 'Die erste Garde',
    description:
      'Platzhalter — dieser Meilenstein wird vom Verein durch ein echtes Ereignis aus der Vereinsgeschichte ersetzt.',
    isPlaceholder: true,
  },
  {
    year: '1988',
    title: 'Ein eigenes Heim',
    description:
      'Platzhalter — dieser Meilenstein wird vom Verein durch ein echtes Ereignis aus der Vereinsgeschichte ersetzt.',
    isPlaceholder: true,
  },
  {
    year: '2004',
    title: 'Der große Umzug',
    description:
      'Platzhalter — dieser Meilenstein wird vom Verein durch ein echtes Ereignis aus der Vereinsgeschichte ersetzt.',
    isPlaceholder: true,
  },
  {
    year: '2021',
    title: '50 Jahre FURRIA',
    description:
      'Platzhalter — dieser Meilenstein wird vom Verein durch ein echtes Ereignis aus der Vereinsgeschichte ersetzt.',
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
