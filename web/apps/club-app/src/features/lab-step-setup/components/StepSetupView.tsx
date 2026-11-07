import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkSsFrame } from '@furria/ui/KkSsFrame';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { useStepSetup } from '../hooks/use-step-setup';
import { SS_TITLE } from '../setup-copy';
import { SsFoot } from './SsFoot';
import { SsHead } from './SsHead';
import { SsStageBody } from './SsStageBody';

interface StepSetupViewProps {
  actId: number;
  title: string;
  screen: StudioScreen;
}

export const StepSetupView: FC<StepSetupViewProps> = ({ actId, title, screen }) => {
  const setup = useStepSetup(screen, actId);

  return (
    <>
      <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>
      <KkSsFrame label={SS_TITLE}>
        <KkSsFrame.Head>
          <SsHead setup={setup} title={title} />
        </KkSsFrame.Head>
        <SsStageBody key={setup.stage} setup={setup} />
        <KkSsFrame.Foot>
          <SsFoot setup={setup} />
        </KkSsFrame.Foot>
      </KkSsFrame>
    </>
  );
};
