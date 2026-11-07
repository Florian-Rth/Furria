import type { FC } from 'react';
import type { StepSetup } from '../hooks/use-step-setup';
import { SsBordersStage } from './SsBordersStage';
import { SsFinishStage } from './SsFinishStage';
import { SsNamesStage } from './SsNamesStage';
import { SsVideoStage } from './SsVideoStage';

interface SsStageBodyProps {
  setup: StepSetup;
}

export const SsStageBody: FC<SsStageBodyProps> = ({ setup }) => {
  switch (setup.stage) {
    case 'video':
      return <SsVideoStage setup={setup} />;
    case 'borders':
      return <SsBordersStage setup={setup} />;
    case 'names':
      return <SsNamesStage setup={setup} />;
    case 'finish':
      return <SsFinishStage setup={setup} />;
  }
};
