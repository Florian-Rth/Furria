import { JOB_LOOP_STEP, JOB_LOOP_STEP_LABEL, tempoTextOf } from '@furria/studio/job-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';

interface JobTransportExtrasProps {
  screen: StudioScreen;
  compact: boolean;
}

export const JobTransportExtras: FC<JobTransportExtrasProps> = ({ screen, compact }) => {
  const { practice } = screen;
  const step = practice.step;
  const looping = practice.loopKind === 'step';
  const loop = (): void => {
    if (step !== null) {
      practice.loopStep(step.stepId);
    }
  };
  const tempo = compact ? practice.rateText : tempoTextOf(practice.rateText);

  return (
    <>
      <KkPillButton
        text={tempo}
        label={practice.rateLabel}
        pressed={practice.slowed}
        onPress={practice.slowDown}
      />
      <KkPillButton
        text={JOB_LOOP_STEP}
        glyph="loop"
        label={JOB_LOOP_STEP_LABEL}
        textShown={!compact}
        pressed={looping}
        disabled={step === null}
        onPress={loop}
      />
    </>
  );
};
