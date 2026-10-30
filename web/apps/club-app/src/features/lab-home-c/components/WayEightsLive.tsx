import { KkWayRibbon } from '@furria/ui/KkWayRibbon';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { fillOf } from '@/features/act-practice/practice-controls';
import type { StudioStep } from '@/features/acts/schemas';

const STEPS_PER_EIGHT = 32;

interface WayEightsLiveProps {
  player: MixPlayer;
  step: StudioStep;
  eights: number;
}

export const WayEightsLive: FC<WayEightsLiveProps> = ({ player, step, eights }) => {
  const grain = eights * STEPS_PER_EIGHT;
  const fill = usePlaybackSelection(
    player,
    (seconds) => Math.floor(fillOf(step, seconds) * grain) / grain,
  );

  return <KkWayRibbon.Eights eights={eights} fill={fill} current />;
};
