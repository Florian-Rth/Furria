import { SetupBorderTune } from '@furria/studio/SetupBorderTune';
import { SetupDeck } from '@furria/studio/SetupDeck';
import { SetupTaskPanel } from '@furria/studio/SetupTaskPanel';
import { SETUP_STAGE_TEXT } from '@furria/studio/step-setup-copy';
import { useSetupBorders } from '@furria/studio/use-setup-borders';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkBigTap } from '@furria/ui/KkBigTap';
import type { FC } from 'react';

interface SetupBordersStageProps {
  setup: StepSetup;
}

export const SetupBordersStage: FC<SetupBordersStageProps> = ({ setup }) => {
  const borders = useSetupBorders(setup);
  const { tap } = borders;
  const wide = setup.screen.editor === 'desk';

  return (
    <>
      <SetupDeck setup={setup} timeline={borders.timeline} />
      <SetupTaskPanel task={borders.task} title={SETUP_STAGE_TEXT.borders} wide={wide}>
        <KkBigTap
          text={tap.text}
          meta={tap.meta}
          label={tap.label}
          disabled={tap.disabled}
          onPress={tap.press}
        />
        <SetupBorderTune tune={borders.tune} />
      </SetupTaskPanel>
    </>
  );
};
