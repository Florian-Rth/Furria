import { useId } from 'react';
import type { HonourCoin } from '../../internal/honours/honour-functions';
import { honourCoinsOf, honourDisplayOf } from '../../internal/honours/honour-functions';
import type { HonourPoint } from '../../internal/honours/honour-geometry';
import { coinSpotsOf } from '../../internal/honours/honour-geometry';
import type { LapState } from '../../internal/honours/honour-laps';
import { lapOf } from '../../internal/honours/honour-laps';
import type { KkRingedAvatarSize, RingMetrics } from '../../internal/honours/honour-metrics';
import {
  AVATAR_COIN_START_DEGREES,
  AVATAR_COIN_STEP_DEGREES,
  faceShareOf,
  ringMetrics,
} from '../../internal/honours/honour-metrics';
import type { HonourMotion } from '../../internal/honours/honour-motion';
import { honourNameOf } from '../../internal/honours/honour-name';
import type { KkAvatarFunction, KkHonours, KkStanding } from '../../internal/honours/honour-types';
import { partIdOf, svgIdOf } from '../../internal/honours/svg-id';
import type { HonourFlag } from '../../internal/honours/use-honour-flag';
import { useHonourFlag } from '../../internal/honours/use-honour-flag';
import { useReducedMotion } from '../../internal/use-reduced-motion';

export interface PlacedCoin {
  coin: HonourCoin;
  spot: HonourPoint;
  order: number;
}

export interface RingedAvatarView {
  metrics: RingMetrics;
  prefix: string;
  clipId: string;
  faceRadius: number;
  faceExtent: string;
  faceShare: number;
  label: string | null;
  lap: LapState;
  bareTrack: boolean;
  play: HonourMotion;
  arrive: boolean;
  sash: KkAvatarFunction | null;
  coins: PlacedCoin[];
  flag: HonourFlag;
}

export const SASH_KEY = 'sash';

export const useRingedAvatar = (
  size: KkRingedAvatarSize,
  honours: KkHonours | undefined,
  standing: KkStanding | undefined,
  arrival: boolean,
): RingedAvatarView => {
  const reduced = useReducedMotion();
  const flag = useHonourFlag();
  const prefix = svgIdOf(useId());
  const metrics = ringMetrics[size];
  const arrive = arrival && !reduced;
  const functions = honours?.functions ?? [];
  const display = honourDisplayOf(functions);
  const coins = honourCoinsOf(display.coins, metrics.coinCount);
  const spots = coinSpotsOf(
    coins.length,
    metrics.metalRadius / metrics.box,
    AVATAR_COIN_START_DEGREES,
    AVATAR_COIN_STEP_DEGREES,
  );
  const faceRadius = standing === undefined ? metrics.faceRadius : metrics.standingFaceRadius;

  return {
    metrics,
    prefix,
    clipId: partIdOf(prefix, SASH_KEY),
    faceRadius,
    faceExtent: faceShareOf(faceRadius, metrics.box),
    faceShare: (faceRadius * 2) / metrics.box,
    label: honours === undefined ? null : honourNameOf(honours, !metrics.interactive),
    lap: lapOf(honours?.sessions ?? 0),
    bareTrack: functions.length > 0,
    play: arrive ? 'arrive' : 'still',
    arrive,
    sash: display.sash,
    coins: coins.flatMap((coin, order) => {
      const spot = spots[order];

      return spot === undefined ? [] : [{ coin, spot, order }];
    }),
    flag,
  };
};
