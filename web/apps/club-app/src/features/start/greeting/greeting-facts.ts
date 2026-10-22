import type { KkClubIcon } from '@furria/ui/club-icon';
import type { PersonFunction } from '@/lib/api/schemas';
import type { StartMine } from '../schemas';
import { isRoundYears, joinDayOf } from '../start-lines';

export const GREETING_FUNCTIONS_SHOWN = 2;

const FUNCTION_ORDER: Record<PersonFunction['kind'], number> = {
  boardSeat: 0,
  role: 1,
  groupAdmin: 2,
};

export type GreetingFact =
  | { kind: 'since'; year: number }
  | { kind: 'function'; name: string; glyph: KkClubIcon | null };

export interface GreetingBadge {
  years: number;
  festive: boolean;
  joinedOn: string;
}

export interface GreetingFacts {
  badge: GreetingBadge | null;
  facts: GreetingFact[];
}

export interface GreetingFactsSource {
  memberSince: string | null;
  functions: readonly PersonFunction[];
  milestone: StartMine | null;
}

const ISO_YEAR_END = 4;

const badgeOf = (milestone: StartMine | null, memberSince: string | null): GreetingBadge | null => {
  if (milestone === null || milestone.years === null || milestone.years <= 0) {
    return null;
  }

  return {
    years: milestone.years,
    festive: isRoundYears(milestone.years),
    joinedOn: joinDayOf(milestone, memberSince),
  };
};

export const toGreetingFacts = ({
  memberSince,
  functions,
  milestone,
}: GreetingFactsSource): GreetingFacts => {
  const badge = badgeOf(milestone, memberSince);
  const since: GreetingFact[] =
    badge === null && memberSince !== null
      ? [{ kind: 'since', year: Number(memberSince.slice(0, ISO_YEAR_END)) }]
      : [];
  const held = [...functions]
    .sort((first, second) => FUNCTION_ORDER[first.kind] - FUNCTION_ORDER[second.kind])
    .slice(0, GREETING_FUNCTIONS_SHOWN)
    .map((entry): GreetingFact => ({ kind: 'function', name: entry.name, glyph: entry.icon }));

  return { badge, facts: [...since, ...held] };
};
