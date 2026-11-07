import { HallDotsLive } from '@furria/studio/HallDotsLive';
import { HALL_FRONT, HALL_VIDEO } from '@furria/studio/hall-copy';
import { PRACTICE_FULLSCREEN, PRACTICE_FULLSCREEN_EXIT } from '@furria/studio/practice-copy';
import { Stage } from '@furria/studio/Stage';
import type { Hall } from '@furria/studio/use-hall';
import { KkHall } from '@furria/ui/KkHall';
import { KkVideo } from '@furria/ui/KkVideo';
import { useKkFullscreen } from '@furria/ui/use-kk-fullscreen';
import type { FC } from 'react';

interface HallStageLayerProps {
  hall: Hall;
}

export const HallStageLayer: FC<HallStageLayerProps> = ({ hall }) => {
  const { scene, playback, video } = hall;
  const gliding = !hall.playing;
  const fullscreen = useKkFullscreen();
  const play = fullscreen.active ? (
    <KkVideo.Play playing={hall.playing} label={hall.playCaption} onToggle={hall.toggle} />
  ) : null;
  const film = hall.videoOn ? (
    <KkVideo label={HALL_VIDEO} fit="fill" fullscreen={fullscreen}>
      <KkVideo.Picture
        label={HALL_VIDEO}
        source={video.source}
        videoRef={video.ref}
        mirrored={video.mirrored}
        focus="centre"
      />
      <KkVideo.Corner side="end">
        {play}
        <KkVideo.Fullscreen
          fullscreen={fullscreen}
          enterLabel={PRACTICE_FULLSCREEN}
          exitLabel={PRACTICE_FULLSCREEN_EXIT}
        />
      </KkVideo.Corner>
    </KkVideo>
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
