import type { ClubIcon } from '@/lib/club-icon';
import { toIsoDay } from '@/lib/day';
import { toBoardTermPeriod } from '../board-terms';
import { toBoardTermSince } from '../members-labels';
import type { MemberBoardTerm } from '../schemas';

export interface BoardTermRow {
  key: string;
  office: string;
  icon: ClubIcon | null;
  isCurrent: boolean;
  sinceLabel: string;
  sinceValue: string;
}

export const useBoardTermRows = (terms: readonly MemberBoardTerm[]): BoardTermRow[] => {
  const today = toIsoDay(new Date());

  return terms.map((term) => {
    const period = toBoardTermPeriod(term, today);

    return {
      key: `${term.boardOfficeId}-${term.since}`,
      office: term.office,
      icon: term.icon,
      isCurrent: period.kind === 'current',
      ...toBoardTermSince(period),
    };
  });
};
