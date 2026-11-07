import {
  nextTextOf,
  SETUP_ANOTHER_VIDEO,
  SETUP_BACK,
  SETUP_GATE_TEXT,
  SETUP_TO_DANCE,
} from '@furria/studio/step-setup-copy';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkActionFoot } from '@furria/ui/KkActionFoot';
import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';

interface SetupFootProps {
  setup: StepSetup;
}

export const SetupFoot: FC<SetupFootProps> = ({ setup }) => {
  const { nextPlace, back, leaveGate } = setup;

  if (nextPlace === null) {
    return (
      <KkActionFoot fade={false}>
        <KkButton variant="outlined" onClick={setup.anotherVideo}>
          {SETUP_ANOTHER_VIDEO}
        </KkButton>
        <KkButton onClick={setup.leave}>{SETUP_TO_DANCE}</KkButton>
      </KkActionFoot>
    );
  }

  const nextText = nextTextOf(nextPlace);
  const locked = leaveGate !== 'open';
  const notice = locked ? SETUP_GATE_TEXT[leaveGate] : null;
  const backButton =
    back === null ? null : (
      <KkButton variant="outlined" onClick={back}>
        {SETUP_BACK}
      </KkButton>
    );

  return (
    <KkActionFoot notice={notice} fade={false}>
      {backButton}
      <KkButton disabled={locked} onClick={setup.next}>
        {nextText}
      </KkButton>
    </KkActionFoot>
  );
};
