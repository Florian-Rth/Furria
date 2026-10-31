import type { GroupAct, GroupActsResponse } from './schemas';

export type SessionPhase = 'coming' | 'running' | 'over';

export interface HistorySession {
  sessionYear: number;
  phase: SessionPhase;
  acts: GroupAct[];
}

const COLLATOR = new Intl.Collator('de-DE');

export const sessionPhaseOf = (sessionYear: number, relevantYear: number): SessionPhase => {
  if (sessionYear > relevantYear) {
    return 'coming';
  }

  return sessionYear === relevantYear ? 'running' : 'over';
};

const byStandingThenName = (left: GroupAct, right: GroupAct): number =>
  Number(left.archived) - Number(right.archived) || COLLATOR.compare(left.name, right.name);

export const actHistoryOf = (response: GroupActsResponse): HistorySession[] => {
  const years = [response.relevantSessionYear, ...response.acts.map((act) => act.sessionYear)];
  const newest = Math.max(...years);
  const oldest = Math.min(...years);

  return Array.from({ length: newest - oldest + 1 }, (_, offset) => newest - offset).map(
    (sessionYear) => ({
      sessionYear,
      phase: sessionPhaseOf(sessionYear, response.relevantSessionYear),
      acts: response.acts.filter((act) => act.sessionYear === sessionYear).sort(byStandingThenName),
    }),
  );
};

export type HistoryActMark = 'archived' | 'mine' | null;

export const historyActMarkOf = (act: GroupAct): HistoryActMark => {
  if (act.archived) {
    return 'archived';
  }

  return act.viewerInCast ? 'mine' : null;
};
