import { SetupFoot } from '@furria/studio/SetupFoot';
import { SetupHead } from '@furria/studio/SetupHead';
import { SetupStageBody } from '@furria/studio/SetupStageBody';
import { STEP_SETUP_TITLE } from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { StepSetupPort } from '@furria/studio/use-step-setup';
import { useStepSetup } from '@furria/studio/use-step-setup';
import { KkSetupFrame } from '@furria/ui/KkSetupFrame';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';

interface StepSetupViewProps {
  title: string;
  screen: StudioScreen;
  port: StepSetupPort;
}

export const StepSetupView: FC<StepSetupViewProps> = ({ title, screen, port }) => {
  const setup = useStepSetup(screen, port);

  return (
    <>
      <KkVisuallyHidden component="h1">{title}</KkVisuallyHidden>
      <KkSetupFrame label={STEP_SETUP_TITLE}>
        <KkSetupFrame.Head>
          <SetupHead setup={setup} title={title} />
        </KkSetupFrame.Head>
        <SetupStageBody key={setup.stage} setup={setup} />
        <KkSetupFrame.Foot>
          <SetupFoot setup={setup} />
        </KkSetupFrame.Foot>
      </KkSetupFrame>
    </>
  );
};
