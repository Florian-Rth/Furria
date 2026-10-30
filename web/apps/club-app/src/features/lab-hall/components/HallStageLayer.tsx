import { KkHall } from '@furria/ui/KkHall';
import { KkPracticeScreen } from '@furria/ui/KkPracticeScreen';
import type { FC } from 'react';
import { HALL_FRONT, HALL_FRONT_AUDIENCE, HALL_STAGE_LABEL } from '../hall-copy';
import type { Hall } from '../hooks/use-hall';
import { HallDotsLive } from './HallDotsLive';

interface HallStageLayerProps {
  hall: Hall;
}

export const HallStageLayer: FC<HallStageLayerProps> = ({ hall }) => {
  const { scene, playback, video } = hall;
  const audience = scene.viewpoint === 'audience';
  const frontLabel = audience ? HALL_FRONT_AUDIENCE : HALL_FRONT;
  const front = audience ? 'bottom' : 'top';
  const gliding = !hall.playing;
  const film = hall.videoOn ? (
    <KkPracticeScreen.Video source={video.source} videoRef={video.ref} mirrored={video.mirrored} />
  ) : null;
  const stage = hall.videoOn ? null : (
    <KkHall.Stage
      label={HALL_STAGE_LABEL}
      frontLabel={frontLabel}
      front={front}
      widthMetres={scene.stage.widthMetres}
      depthMetres={scene.stage.depthMetres}
      artworkSvg={scene.stage.artworkSvg}
    >
      <HallDotsLive player={playback.player} scene={scene} gliding={gliding} />
    </KkHall.Stage>
  );

  return (
    <KkHall.Area area="stage" fill="centre">
      {film}
      {stage}
    </KkHall.Area>
  );
};
