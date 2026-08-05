import { currentSession, FOUNDING_YEAR, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';
import { GROUPS } from './groups-content';

export const storyChapter = {
  numeral: '01',
  kicker: 'WER WIR SIND',
  title: 'EIN VEREIN MIT HERZ',
} as const;

export const storyPullQuote =
  'Wir leben die fünfte Jahreszeit — und arbeiten daran, sie auf eine sechste zu erweitern.';

export const storyBodyPlaceholder =
  'Vom ersten Besen bis zur eigenen Zeitzone: Der Furrsche Carnevals Club bringt Menschen aus Großfurra zusammen, die den Karneval lieben — und die sich einig sind, dass eine Session grundsätzlich zu kurz ist.';

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
