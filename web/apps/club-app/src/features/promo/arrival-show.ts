import type { KkPromoWallName } from '@furria/ui/promo-stage-types';
import type { PromoMember } from './schemas';

export interface ArrivalShow {
  names: string[];
  more: number;
  ms: number;
}

const SHOWN_NAMES = 4;
const BASE_MS = 4600;
const PER_EXTRA_NAME_MS = 450;

export const displayNameOf = (member: PromoMember): string =>
  member.lastInitial === '' ? member.firstName : `${member.firstName} ${member.lastInitial}.`;

export const freshMembersOf = (
  seen: ReadonlySet<number>,
  members: readonly PromoMember[],
): PromoMember[] => members.filter((member) => !seen.has(member.accountId));

export const arrivalShowOf = (queue: readonly PromoMember[]): ArrivalShow => {
  const names = queue.slice(0, SHOWN_NAMES).map(displayNameOf);

  return {
    names,
    more: Math.max(queue.length - SHOWN_NAMES, 0),
    ms: BASE_MS + (names.length - 1) * PER_EXTRA_NAME_MS,
  };
};

export const wallNamesOf = (
  members: readonly PromoMember[],
  knownAtLoopStart: ReadonlySet<number> | null,
): KkPromoWallName[] =>
  members.map((member) => ({
    key: member.accountId,
    name: displayNameOf(member),
    fresh: knownAtLoopStart !== null && !knownAtLoopStart.has(member.accountId),
  }));
