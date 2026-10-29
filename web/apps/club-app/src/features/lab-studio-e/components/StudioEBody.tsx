import { KkStudioEDescription } from '@furria/ui/KkStudioEDescription';
import { KkStudioEStepName } from '@furria/ui/KkStudioEStepName';
import { KkStudioEView } from '@furria/ui/KkStudioEView';
import type { FC } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioEPractice } from '../hooks/use-studio-e-practice';
import { useStudioEVideo } from '../hooks/use-studio-e-video';
import { STUDIO_E_LABEL } from '../studio-e-copy';
import { StudioECountLive } from './StudioECountLive';
import { StudioEStageLayer } from './StudioEStageLayer';
import { StudioETransportLayer } from './StudioETransportLayer';
import { StudioEVideoLayer } from './StudioEVideoLayer';

interface StudioEBodyProps {
  studio: Studio;
  viewerId: number | null;
}

export const StudioEBody: FC<StudioEBodyProps> = ({ studio, viewerId }) => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = useStudioEPractice(playback);
  const video = useStudioEVideo(studio, playback);

  return (
    <KkStudioEView label={STUDIO_E_LABEL}>
      <KkStudioEView.Head>
        <KkStudioEStepName stepKey={practice.stepKey} name={practice.stepName} />
        <StudioECountLive player={playback.player} segments={playback.segments} />
      </KkStudioEView.Head>
      <KkStudioEView.Middle>
        <StudioEStageLayer studio={studio} playback={playback} />
        <StudioEVideoLayer video={video} />
      </KkStudioEView.Middle>
      <KkStudioEView.Note>
        <KkStudioEDescription stepKey={practice.stepKey} text={practice.note} />
      </KkStudioEView.Note>
      <KkStudioEView.Foot>
        <StudioETransportLayer playback={playback} practice={practice} video={video} />
      </KkStudioEView.Foot>
    </KkStudioEView>
  );
};
