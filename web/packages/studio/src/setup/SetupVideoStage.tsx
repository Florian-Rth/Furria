import { SetupDeck } from '@furria/studio/SetupDeck';
import { SetupTaskPanel } from '@furria/studio/SetupTaskPanel';
import { SetupVideoCheck } from '@furria/studio/SetupVideoCheck';
import { SetupVideoPick } from '@furria/studio/SetupVideoPick';
import { SETUP_STAGE_TEXT } from '@furria/studio/step-setup-copy';
import { useSetupVideo } from '@furria/studio/use-setup-video';
import type { StepSetup } from '@furria/studio/use-step-setup';
import type { FC } from 'react';

interface SetupVideoStageProps {
  setup: StepSetup;
}

export const SetupVideoStage: FC<SetupVideoStageProps> = ({ setup }) => {
  const videos = useSetupVideo(setup);
  const wide = setup.screen.editor === 'desk';
  const { chosen } = videos;
  const body =
    chosen === null ? <SetupVideoPick videos={videos} /> : <SetupVideoCheck chosen={chosen} />;

  return (
    <>
      <SetupDeck setup={setup} timeline={videos.match.timeline} />
      <SetupTaskPanel task={videos.task} title={SETUP_STAGE_TEXT.video} wide={wide}>
        {body}
      </SetupTaskPanel>
    </>
  );
};
