import { KkHall } from '@furria/ui/KkHall';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { HallScene } from '../hall-scene';
import { hallDotsAt } from '../hall-scene';

interface HallDotsLiveProps {
  player: MixPlayer;
  scene: HallScene;
  gliding: boolean;
}

export const HallDotsLive: FC<HallDotsLiveProps> = ({ player, scene, gliding }) => {
  const seconds = usePlaybackSeconds(player);
  const dots = hallDotsAt(scene, seconds).map((dot) => (
    <KkHall.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      moving={dot.moving}
      nameSide={dot.nameSide}
      gliding={gliding}
    />
  ));

  return <>{dots}</>;
};
