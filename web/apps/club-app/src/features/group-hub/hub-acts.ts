import type { GroupAct, GroupActsResponse } from '@/features/acts/schemas';

export interface HubActs {
  current: GroupAct[];
  recorded: number;
  firstSessionYear: number | null;
}

export const hubActsOf = (response: GroupActsResponse): HubActs => {
  const standing = response.acts.filter((act) => !act.archived);
  const years = standing.map((act) => act.sessionYear);

  return {
    current: standing.filter((act) => act.sessionYear === response.relevantSessionYear),
    recorded: standing.length,
    firstSessionYear: years.length === 0 ? null : Math.min(...years),
  };
};
