import type { MemberBoardTerm } from './schemas';

export type BoardTermPeriod =
  | { kind: 'current'; since: string }
  | { kind: 'past'; since: string; until: string };

export const toBoardTermPeriod = (
  term: Pick<MemberBoardTerm, 'since' | 'until'>,
  todayIsoDay: string,
): BoardTermPeriod =>
  term.until === null || term.until >= todayIsoDay
    ? { kind: 'current', since: term.since }
    : { kind: 'past', since: term.since, until: term.until };
