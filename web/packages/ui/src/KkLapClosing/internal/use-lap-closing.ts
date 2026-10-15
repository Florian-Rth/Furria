import { useEffect, useId, useState } from 'react';
import type { ForgeChip } from '../../internal/honours/honour-forge';
import { forgeChipsOf } from '../../internal/honours/honour-forge';
import type { HonourCoin } from '../../internal/honours/honour-functions';
import { honourCoinsOf, honourDisplayOf } from '../../internal/honours/honour-functions';
import type { HonourPoint } from '../../internal/honours/honour-geometry';
import { coinSpotsOf } from '../../internal/honours/honour-geometry';
import type { KkMetalGradient, LapState } from '../../internal/honours/honour-laps';
import { gradientOf, lapOf } from '../../internal/honours/honour-laps';
import type { KkRingedAvatarSize, RingMetrics } from '../../internal/honours/honour-metrics';
import {
  AVATAR_COIN_START_DEGREES,
  AVATAR_COIN_STEP_DEGREES,
  faceShareOf,
  ringMetrics,
} from '../../internal/honours/honour-metrics';
import type { ClosingPhase, HonourMotion } from '../../internal/honours/honour-motion';
import {
  closingPlayOf,
  FORGE_LEAD_SECONDS,
  STRIKE_LEAD_SECONDS,
} from '../../internal/honours/honour-motion';
import { honourNameOf } from '../../internal/honours/honour-name';
import type { KkAvatarFunction, KkHonours } from '../../internal/honours/honour-types';
import { partIdOf, svgIdOf } from '../../internal/honours/svg-id';
import { useReducedMotion } from '../../internal/use-reduced-motion';

const CHIP_COUNT = 11;
const CHIP_REACH = 1.25;
const CHIP_SIZE = 0.09;
const MILLISECONDS = 1000;

export interface ClosingCoin {
  coin: HonourCoin;
  spot: HonourPoint;
}

export interface LapClosingView {
  metrics: RingMetrics;
  prefix: string;
  clipId: string;
  faceExtent: string;
  label: string;
  lap: LapState;
  play: HonourMotion;
  chips: ForgeChip[];
  chipSize: number;
  gradient: KkMetalGradient;
  sash: KkAvatarFunction | null;
  coins: ClosingCoin[];
}

const lapAt = (phase: ClosingPhase, sessions: number): LapState => {
  switch (phase) {
    case 'before':
      return lapOf(sessions - 1);
    case 'strike':
      return lapOf(sessions, true);
    case 'forged':
      return lapOf(sessions);
  }
};

const gradientAt = (lap: LapState): KkMetalGradient =>
  lap.kind === 'none' ? 'bronze' : gradientOf(lap.metal);

export const useLapClosing = (size: KkRingedAvatarSize, honours: KkHonours): LapClosingView => {
  const reduced = useReducedMotion();
  const prefix = svgIdOf(useId());
  const [phase, setPhase] = useState<ClosingPhase>('before');
  const metrics = ringMetrics[size];

  useEffect(() => {
    const strike = window.setTimeout(() => {
      setPhase('strike');
    }, STRIKE_LEAD_SECONDS * MILLISECONDS);
    const forge = window.setTimeout(() => {
      setPhase('forged');
    }, FORGE_LEAD_SECONDS * MILLISECONDS);

    return () => {
      window.clearTimeout(strike);
      window.clearTimeout(forge);
    };
  }, []);

  const shownPhase: ClosingPhase = reduced ? 'forged' : phase;
  const play = closingPlayOf(shownPhase, reduced);
  const lap = lapAt(shownPhase, honours.sessions);
  const display = honourDisplayOf(honours.functions);
  const coins = honourCoinsOf(display.coins, metrics.coinCount);
  const spots = coinSpotsOf(
    coins.length,
    metrics.metalRadius / metrics.box,
    AVATAR_COIN_START_DEGREES,
    AVATAR_COIN_STEP_DEGREES,
  );

  return {
    metrics,
    prefix,
    clipId: partIdOf(prefix, 'sash'),
    faceExtent: faceShareOf(metrics.faceRadius, metrics.box),
    label: honourNameOf(honours, true),
    lap,
    play,
    chips: play === 'forge' ? forgeChipsOf(CHIP_COUNT, metrics.box * CHIP_REACH) : [],
    chipSize: metrics.box * CHIP_SIZE,
    gradient: gradientAt(lap),
    sash: display.sash,
    coins: coins.flatMap((coin, order) => {
      const spot = spots[order];

      return spot === undefined ? [] : [{ coin, spot }];
    }),
  };
};
