import type { GroupAct, GroupActsResponse } from '@/features/acts/schemas';

export interface HubActSession {
  sessionYear: number;
  acts: GroupAct[];
}

export interface HubActs {
  current: GroupAct[];
  earlier: HubActSession[];
}

export const hubActsOf = (response: GroupActsResponse): HubActs => {
  const current = response.acts.filter((act) => act.sessionYear === response.relevantSessionYear);
  const earlier = new Map<number, GroupAct[]>();

  for (const act of response.acts) {
    if (act.sessionYear !== response.relevantSessionYear) {
      earlier.set(act.sessionYear, [...(earlier.get(act.sessionYear) ?? []), act]);
    }
  }

  return {
    current,
    earlier: [...earlier.entries()]
      .sort(([first], [second]) => second - first)
      .map(([sessionYear, acts]) => ({ sessionYear, acts })),
  };
};
