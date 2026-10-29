import { KkStudioEScreen } from '@furria/ui/KkStudioEScreen';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { StudioEPractice } from '../hooks/use-studio-e-practice';
import type { StudioEVideo } from '../hooks/use-studio-e-video';
import { noVideoEyebrowOf, STUDIO_E_NO_VIDEO_NOTE, STUDIO_E_SIDE_LABEL } from '../studio-e-copy';
import { StudioEStageLayer } from './StudioEStageLayer';

interface StudioESideProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: StudioEPractice;
  video: StudioEVideo;
}

export const StudioESide: FC<StudioESideProps> = ({ studio, playback, practice, video }) => {
  const filmed = video.hero === 'video';
  const eyebrow = noVideoEyebrowOf(practice.partName);
  const note = practice.note ?? STUDIO_E_NO_VIDEO_NOTE;

  return (
    <KkStudioEScreen label={STUDIO_E_SIDE_LABEL} fit="fill">
      <KkStudioEScreen.Layer shown={filmed} tone="clear">
        <StudioEStageLayer studio={studio} playback={playback} />
      </KkStudioEScreen.Layer>
      <KkStudioEScreen.Layer shown={!filmed} tone="clear">
        <KkStudioEScreen.Note eyebrow={eyebrow} text={note} />
      </KkStudioEScreen.Layer>
    </KkStudioEScreen>
  );
};
