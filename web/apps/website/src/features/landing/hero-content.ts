import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';
import { formatMemberCount, UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';

export interface HeroStat {
  value: string;
  label: string;
}

const openingLabel = `${SESSION_OPENING_DAY}.${SESSION_OPENING_MONTH}. ERÖFFNUNG`;

export const buildEyebrowLabel = (sessionLabel: string | undefined): string =>
  sessionLabel === undefined ? `★ ${openingLabel}` : `★ SESSION ${sessionLabel} · ${openingLabel}`;

const MEMBERS_LABEL = 'Mitglieder';
const GROUPS_LABEL = 'Garden & Gruppen';
const FOUNDED_LABEL = 'gegründet';

const pendingHeroStats: HeroStat[] = [
  { value: UNKNOWN_FACT, label: MEMBERS_LABEL },
  { value: UNKNOWN_FACT, label: GROUPS_LABEL },
  { value: UNKNOWN_FACT, label: FOUNDED_LABEL },
];

export const buildHeroStats = (club: PublicClub | undefined): HeroStat[] => {
  if (club === undefined) {
    return pendingHeroStats;
  }

  const counts: HeroStat[] = [
    { value: formatMemberCount(club.memberCount), label: MEMBERS_LABEL },
    { value: String(club.groupCount), label: GROUPS_LABEL },
  ];

  return club.foundedYear === null
    ? counts
    : [...counts, { value: String(club.foundedYear), label: FOUNDED_LABEL }];
};
