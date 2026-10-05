import type { GreetingAct, GreetingMoment } from './greeting-act';
import { isRoundYears } from './greeting-act';

export type GreetingPlay = 'still' | 'live' | 'full';

export interface GreetingPlayDecision {
  play: GreetingPlay;
  burst: boolean;
}

const CELEBRATED_MOMENTS: ReadonlySet<GreetingMoment> = new Set([
  'carnivalCall',
  'birthday',
  'womensCarnivalDay',
  'roseMonday',
  'welcome',
]);

const celebrates = (act: GreetingAct): boolean =>
  CELEBRATED_MOMENTS.has(act.moment) ||
  (act.moment === 'joinAnniversary' && isRoundYears(act.years));

export const greetingPlayOf = (act: GreetingAct, reducedMotion: boolean): GreetingPlayDecision => {
  if (reducedMotion) {
    return { play: 'still', burst: false };
  }
  if (act.moment === 'openingCountdown') {
    return { play: 'live', burst: false };
  }

  return { play: 'full', burst: celebrates(act) };
};
