import { Stage } from '@furria/studio/Stage';
import { KkHall } from '@furria/ui/KkHall';
import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import { HALL_FRONT } from '../hall-copy';
import type { Hall } from '../hooks/use-hall';
import { HallDotsLive } from './HallDotsLive';

interface HallStageLayerProps {
  hall: Hall;
}

export const HallStageLayer: FC<HallStageLayerProps> = ({ hall }) => {
  const { scene, playback, video } = hall;
  const gliding = !hall.playing;
  const film = hall.videoOn ? (
    <KkPracticeScreen.Video source={video.source} videoRef={video.ref} mirrored={video.mirrored} />
  ) : null;
  const stage = hall.videoOn ? null : (
    <Stage
      label={hall.stageLabel}
      stage={scene.stage}
      viewpoint={scene.viewpoint}
      fit="contain"
      frontLabel={HALL_FRONT}
    >
      <HallDotsLive player={playback.player} scene={scene} gliding={gliding} />
    </Stage>
  );

  return (
    <KkHall.Area area="stage" fill="centre">
      {film}
      {stage}
    </KkHall.Area>
  );
};
