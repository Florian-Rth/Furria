import { currentSession, FOUNDING_YEAR, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';
import { GROUPS } from './groups-content';

export const storyChapter = {
  numeral: '01',
  kicker: 'WER WIR SIND',
  title: 'EIN VEREIN MIT HERZ',
} as const;

export const storyPullQuote =
  'Wir sind ein Verein, der die fünfte Jahreszeit lebt — auf der Bühne, im Saal und weit über die Session hinaus.';

export const storyBodyPlaceholder =
  'Vom ersten Besen bis zur großen Prunksitzung: Der Furrsche Carnevals Club bringt Menschen aus Großbesenstadt zusammen, die den Karneval lieben — über Generationen, Garden und Gruppen hinweg.';

export const storyBodyPlaceholderNote =
  'Hier steht bald die echte Vereinsgeschichte — dieser Text ist noch ein Platzhalter.';

export const storyPhotoCaption = 'vereinsfoto';

export interface StoryStat {
  value: string;
  label: string;
}

export const buildStoryStats = (
  foundingYear: number,
  memberCount: string,
  groupCount: number,
  sessionNumber: number,
): StoryStat[] => [
  { value: String(foundingYear), label: 'gegründet' },
  { value: memberCount, label: 'Mitglieder' },
  { value: String(groupCount), label: 'Gruppen' },
  { value: `${sessionNumber}.`, label: 'Session' },
];

export const storyStats = buildStoryStats(
  FOUNDING_YEAR,
  MEMBER_COUNT_PLACEHOLDER,
  GROUPS.length,
  currentSession.number,
);
