import type { FC } from 'react';
import { useSetupVideo } from '../hooks/use-setup-video';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_STAGE_TEXT } from '../setup-copy';
import { SsDeck } from './SsDeck';
import { SsTask } from './SsTask';
import { SsVideoCheck } from './SsVideoCheck';
import { SsVideoPick } from './SsVideoPick';

interface SsVideoStageProps {
  setup: StepSetup;
}

export const SsVideoStage: FC<SsVideoStageProps> = ({ setup }) => {
  const videos = useSetupVideo(setup);
  const wide = setup.screen.editor === 'desk';
  const { chosen } = videos;
  const body = chosen === null ? <SsVideoPick videos={videos} /> : <SsVideoCheck chosen={chosen} />;

  return (
    <>
      <SsDeck setup={setup} timeline={videos.match.timeline} />
      <SsTask task={videos.task} title={SS_STAGE_TEXT.video} wide={wide}>
        {body}
      </SsTask>
    </>
  );
};
