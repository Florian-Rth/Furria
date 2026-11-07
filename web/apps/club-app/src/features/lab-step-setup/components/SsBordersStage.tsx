import { KkSsBigTap } from '@furria/ui/KkSsBigTap';
import type { FC } from 'react';
import { useSetupBorders } from '../hooks/use-setup-borders';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_STAGE_TEXT } from '../setup-copy';
import { SsBorderTune } from './SsBorderTune';
import { SsDeck } from './SsDeck';
import { SsTask } from './SsTask';

interface SsBordersStageProps {
  setup: StepSetup;
}

export const SsBordersStage: FC<SsBordersStageProps> = ({ setup }) => {
  const borders = useSetupBorders(setup);
  const { tap } = borders;
  const wide = setup.screen.editor === 'desk';

  return (
    <>
      <SsDeck setup={setup} timeline={borders.timeline} />
      <SsTask task={borders.task} title={SS_STAGE_TEXT.borders} wide={wide}>
        <KkSsBigTap
          text={tap.text}
          meta={tap.meta}
          label={tap.label}
          disabled={tap.disabled}
          onPress={tap.press}
        />
        <SsBorderTune tune={borders.tune} />
      </SsTask>
    </>
  );
};
