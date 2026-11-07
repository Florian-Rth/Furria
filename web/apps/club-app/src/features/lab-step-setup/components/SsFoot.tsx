import { KkActionFoot } from '@furria/ui/KkActionFoot';
import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { StepSetup } from '../hooks/use-step-setup';
import { nextTextOf, SS_ANOTHER_VIDEO, SS_BACK, SS_GATE_TEXT, SS_TO_DANCE } from '../setup-copy';

interface SsFootProps {
  setup: StepSetup;
}

export const SsFoot: FC<SsFootProps> = ({ setup }) => {
  const { nextPlace, back, leaveGate } = setup;

  if (nextPlace === null) {
    return (
      <KkActionFoot fade={false}>
        <KkButton variant="outlined" onClick={setup.anotherVideo}>
          {SS_ANOTHER_VIDEO}
        </KkButton>
        <KkButton onClick={setup.leave}>{SS_TO_DANCE}</KkButton>
      </KkActionFoot>
    );
  }

  const nextText = nextTextOf(nextPlace);
  const locked = leaveGate !== 'open';
  const notice = locked ? SS_GATE_TEXT[leaveGate] : null;
  const backButton =
    back === null ? null : (
      <KkButton variant="outlined" onClick={back}>
        {SS_BACK}
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
