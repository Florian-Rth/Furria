import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkEjButton } from '@furria/ui/KkEjButton';
import type { FC } from 'react';
import { EJ_LOOP_STEP, EJ_LOOP_STEP_LABEL, tempoTextOf } from '../edit-jobs-copy';

interface EjTransportExtrasProps {
  screen: StudioScreen;
  compact: boolean;
}

export const EjTransportExtras: FC<EjTransportExtrasProps> = ({ screen, compact }) => {
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
      <KkEjButton
        text={tempo}
        label={practice.rateLabel}
        pressed={practice.slowed}
        onPress={practice.slowDown}
      />
      <KkEjButton
        text={EJ_LOOP_STEP}
        glyph="loop"
        label={EJ_LOOP_STEP_LABEL}
        textShown={!compact}
        pressed={looping}
        disabled={step === null}
        onPress={loop}
      />
    </>
  );
};
