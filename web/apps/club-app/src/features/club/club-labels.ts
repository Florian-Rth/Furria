import { formatSessionNumber } from '@/lib/membership-labels';
import type { ClubStats } from './schemas';

export type ClubStatTone = 'default' | 'accent';

export interface ClubStatEntry {
  id: string;
  label: string;
  count: number;
  tone: ClubStatTone;
}

const MEMBERS_LABEL = 'Mitglieder';
const GROUPS_LABEL = 'Gruppen';
const JOINED_LABEL = 'Neue diese Session';

const OPENING_TODAY_LABEL = 'heute um 11:11 Uhr';
const ONE_DAY_LEFT_LABEL = 'noch 1 Tag';
const ONE_DAY = 1;

export const MOTTO_PENDING_LABEL = 'Das Motto steht noch aus';

export const CLUB_LOADING_LABEL = 'Der Verein wird geladen';

export const toCountdownLabel = (days: number): string => {
  if (days <= 0) {
    return OPENING_TODAY_LABEL;
  }
  if (days === ONE_DAY) {
    return ONE_DAY_LEFT_LABEL;
  }

  return `noch ${days} Tage`;
};

export const toNumberLabel = (sessionNumber: number | null): string | null =>
  sessionNumber === null ? null : formatSessionNumber(sessionNumber);

export const toClubStatEntries = (stats: ClubStats): ClubStatEntry[] => {
  const entries: ClubStatEntry[] = [
    { id: 'members', label: MEMBERS_LABEL, count: stats.memberCount, tone: 'default' },
    { id: 'groups', label: GROUPS_LABEL, count: stats.groupCount, tone: 'default' },
    { id: 'joined', label: JOINED_LABEL, count: stats.joinedThisSessionCount, tone: 'accent' },
  ];

  return entries.filter((entry) => entry.count > 0);
};
