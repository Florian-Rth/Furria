import { SetupBordersStage } from '@furria/studio/SetupBordersStage';
import { SetupFinishStage } from '@furria/studio/SetupFinishStage';
import { SetupNamesStage } from '@furria/studio/SetupNamesStage';
import { SetupVideoStage } from '@furria/studio/SetupVideoStage';
import type { StepSetup } from '@furria/studio/use-step-setup';
import type { FC } from 'react';

interface SetupStageBodyProps {
  setup: StepSetup;
}

export const SetupStageBody: FC<SetupStageBodyProps> = ({ setup }) => {
  switch (setup.stage) {
    case 'video':
      return <SetupVideoStage setup={setup} />;
    case 'borders':
      return <SetupBordersStage setup={setup} />;
    case 'names':
      return <SetupNamesStage setup={setup} />;
    case 'finish':
      return <SetupFinishStage setup={setup} />;
  }
};
