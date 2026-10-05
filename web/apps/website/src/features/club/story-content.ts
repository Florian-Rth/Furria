import { formatMemberCount, UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';

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

const FOUNDED_LABEL = 'gegründet';
const MEMBERS_LABEL = 'Mitglieder';
const GROUPS_LABEL = 'Gruppen';

const pendingStoryStats: StoryStat[] = [
  { value: UNKNOWN_FACT, label: FOUNDED_LABEL },
  { value: UNKNOWN_FACT, label: MEMBERS_LABEL },
  { value: UNKNOWN_FACT, label: GROUPS_LABEL },
];

const countStatsOf = (club: PublicClub): StoryStat[] => [
  { value: formatMemberCount(club.memberCount), label: MEMBERS_LABEL },
  { value: String(club.groupCount), label: GROUPS_LABEL },
];

export const buildStoryStats = (club: PublicClub | undefined): StoryStat[] => {
  if (club === undefined) {
    return pendingStoryStats;
  }

  return club.foundedYear === null
    ? countStatsOf(club)
    : [{ value: String(club.foundedYear), label: FOUNDED_LABEL }, ...countStatsOf(club)];
};
