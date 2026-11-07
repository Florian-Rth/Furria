import { SS_PICTURE, SS_VIDEO_AREA, SS_VIDEO_EMPTY } from '@furria/studio/step-setup-copy';
import { useSetupFilm } from '@furria/studio/use-setup-film';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkLesson } from '@furria/ui/KkLesson';
import { KkVideo } from '@furria/ui/KkVideo';
import type { FC } from 'react';

interface SetupPictureProps {
  setup: StepSetup;
}

const VIDEO_ASPECT = 16 / 9;

export const SetupPicture: FC<SetupPictureProps> = ({ setup }) => {
  const film = useSetupFilm(setup);
  const note = film.source === null ? <KkVideo.Note text={SS_VIDEO_EMPTY} /> : null;

  return (
    <KkLesson.Picture label={SS_PICTURE} paired={false} docked>
      <KkLesson.Layer place="main" aspect={VIDEO_ASPECT} tone="ink">
        <KkVideo label={SS_VIDEO_AREA} fit="fill">
          <KkVideo.Picture
            label={SS_VIDEO_AREA}
            source={film.source}
            videoRef={film.ref}
            mirrored={false}
            focus="centre"
          />
          {note}
        </KkVideo>
      </KkLesson.Layer>
    </KkLesson.Picture>
  );
};
