import type { KkPromoArrival, KkPromoWallName } from '@furria/ui/promo-stage-types';
import { relevantSessionYear, sessionYearsLabelOf } from '@/lib/club';
import { wallNamesOf } from '../arrival-show';
import { arrivalTickerOf, PROMO_TICKER } from '../promo-copy';
import type { ReelSceneKey, ReelSlot } from '../reel-timeline';
import { REEL_LEAVE_MS, reelScenesOf, reelSlotsOf } from '../reel-timeline';
import type { ReelClock } from './reel-clock';
import { useLoopBaseline } from './use-loop-baseline';
import { usePromoMembers } from './use-promo-members';
import { useReelClock } from './use-reel-clock';
import { useReelPosition } from './use-reel-position';

const INDEX_OF: Partial<Record<ReelSceneKey, number>> = {
  start: 0,
  calendar: 1,
  event: 2,
  dance: 3,
  gallery: 4,
  website: 5,
  beer: 6,
};
const NO_INDEX = -1;
const ACCESS_PATH = '/request-access';
const FIRST_LOOP = reelScenesOf(true);
const LATER_LOOP = reelScenesOf(false);

interface PromoReel {
  clock: ReelClock;
  slots: ReelSlot[];
  wallNames: KkPromoWallName[];
  arrival: KkPromoArrival | null;
  cornerShown: boolean;
  indexActive: number;
  tickerItems: readonly string[];
  yearsLabel: string;
  accessUrl: string;
  accessAddress: string;
}

export const usePromoReel = (): PromoReel => {
  const { members, arrival } = usePromoMembers();
  const clock = useReelClock(arrival !== null);
  const position = useReelPosition(clock, FIRST_LOOP, LATER_LOOP, REEL_LEAVE_MS);
  const knownAtLoopStart = useLoopBaseline(position.loop, members, members.length > 0);
  const slots = reelSlotsOf(position, FIRST_LOOP, LATER_LOOP);
  const liveKey = slots.find((slot) => slot.phase === 'live')?.scene.key;

  return {
    clock,
    slots,
    wallNames: wallNamesOf(members, knownAtLoopStart),
    arrival,
    cornerShown: position.loop > 0 && liveKey !== 'finale',
    indexActive: liveKey === undefined ? NO_INDEX : (INDEX_OF[liveKey] ?? NO_INDEX),
    tickerItems: arrival === null ? PROMO_TICKER : arrivalTickerOf(arrival.names),
    yearsLabel: sessionYearsLabelOf(relevantSessionYear(new Date())),
    accessUrl: `${window.location.origin}${ACCESS_PATH}`,
    accessAddress: window.location.host,
  };
};
