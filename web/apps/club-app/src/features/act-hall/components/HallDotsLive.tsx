import type { MixPlayer } from '@furria/studio/mix-player';
import { Stage } from '@furria/studio/Stage';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import type { KkStageInkDiscKind } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import type { HallDotKind, HallScene } from '../hall-scene';
import { hallDotsAt } from '../hall-scene';

const discKinds: Record<HallDotKind, KkStageInkDiscKind> = {
  present: 'cast',
  absent: 'absent',
  empty: 'open',
};

interface HallDotsLiveProps {
  player: MixPlayer;
  scene: HallScene;
  gliding: boolean;
}

export const HallDotsLive: FC<HallDotsLiveProps> = ({ player, scene, gliding }) => {
  const seconds = usePlaybackSeconds(player);
  const dots = hallDotsAt(scene, seconds).map((dot) => (
    <Stage.Dot
      key={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={discKinds[dot.kind]}
      moving={dot.moving}
      name={dot.name}
      nameSide={dot.nameSide}
      glide={gliding}
    />
  ));

  return <>{dots}</>;
};
