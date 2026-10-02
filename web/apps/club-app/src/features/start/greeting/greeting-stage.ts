import type { KkGreetingTempo } from '@furria/ui';
import { msUntilNextMinute } from '@/lib/minute-clock';
import type { GreetingAct } from './greeting-act';
import type { GreetingCopy } from './greeting-copy';
import { HEADLINE_DECKS } from './greeting-decks';

export interface GreetingStage {
  deck: readonly string[];
  nameDeck: readonly string[] | undefined;
  tempo: KkGreetingTempo;
  countFrom: number | undefined;
}

const MS_PER_SECOND = 1000;
const ANNIVERSARY_COUNT_LEAD = 5;

export const toGreetingStage = (
  act: GreetingAct,
  copy: Pick<GreetingCopy, 'deck'>,
): GreetingStage => ({
  ...HEADLINE_DECKS[copy.deck],
  tempo: act.moment === 'ashWednesday' ? 'slow' : 'regular',
  countFrom:
    act.moment === 'joinAnniversary' ? Math.max(0, act.years - ANNIVERSARY_COUNT_LEAD) : undefined,
});

export const greetingTickDelayOf = (now: Date, everySecond: boolean): number =>
  everySecond ? MS_PER_SECOND - now.getMilliseconds() : msUntilNextMinute(now);
