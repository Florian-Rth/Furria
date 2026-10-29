import { KkStudioEDescription } from '@furria/ui/KkStudioEDescription';
import { KkStudioEStepName } from '@furria/ui/KkStudioEStepName';
import { KkStudioESteps } from '@furria/ui/KkStudioESteps';
import { KkStudioEView } from '@furria/ui/KkStudioEView';
import type { FC } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioEPractice } from '../hooks/use-studio-e-practice';
import { useStudioESteps } from '../hooks/use-studio-e-steps';
import { useStudioEVideo } from '../hooks/use-studio-e-video';
import { STUDIO_E_LABEL, STUDIO_E_STEPS_OPEN } from '../studio-e-copy';
import { StudioEBarControls } from './StudioEBarControls';
import { StudioECountLive } from './StudioECountLive';
import { StudioEHero } from './StudioEHero';
import { StudioESide } from './StudioESide';
import { StudioESteps } from './StudioESteps';

interface StudioEBodyProps {
  studio: Studio;
  viewerId: number | null;
}

export const StudioEBody: FC<StudioEBodyProps> = ({ studio, viewerId }) => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = useStudioEPractice(playback);
  const video = useStudioEVideo(studio, playback);
  const steps = useStudioESteps(studio, playback, practice);
  return (
    <KkStudioEView label={STUDIO_E_LABEL}>
      <KkStudioEView.Head>
        <KkStudioESteps.Trigger
          label={STUDIO_E_STEPS_OPEN}
          expanded={steps.open}
          onOpen={steps.show}
        >
          <KkStudioEView.Titles>
            <KkStudioEStepName stepKey={practice.stepKey} name={practice.stepName} />
            <KkStudioEDescription stepKey={practice.stepKey} text={practice.note} />
          </KkStudioEView.Titles>
        </KkStudioESteps.Trigger>
        <StudioECountLive player={playback.player} segments={playback.segments} />
      </KkStudioEView.Head>
      <KkStudioEView.Hero>
        <StudioEHero studio={studio} playback={playback} practice={practice} video={video} />
      </KkStudioEView.Hero>
      <KkStudioEView.Side>
        <StudioESide studio={studio} playback={playback} practice={practice} video={video} />
      </KkStudioEView.Side>
      <KkStudioEView.Controls>
        <StudioEBarControls playback={playback} practice={practice} />
      </KkStudioEView.Controls>
      <StudioESteps steps={steps} />
    </KkStudioEView>
  );
};
