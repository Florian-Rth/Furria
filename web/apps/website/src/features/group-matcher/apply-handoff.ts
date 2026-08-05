import type { Group } from '@/lib/seed/groups';
import type { GroupMatch } from './scoring';

export const APPLY_PATH = '/join/apply';

export const HANDOFF_GROUP_LIMIT = 3;

export const selectHandoffGroups = (matches: GroupMatch[]): Group[] =>
  matches.slice(0, HANDOFF_GROUP_LIMIT).map((match) => match.group);

export const buildApplyHref = (groupIds: string[]): string => {
  if (groupIds.length === 0) {
    return APPLY_PATH;
  }

  return `${APPLY_PATH}?groups=${groupIds.map(encodeURIComponent).join(',')}`;
};
