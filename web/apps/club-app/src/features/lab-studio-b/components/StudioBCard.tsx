import type { KkStudioBManualCardPlacement } from '@furria/ui/KkStudioBManual';
import { KkStudioBManual } from '@furria/ui/KkStudioBManual';
import type { FC, Ref } from 'react';
import { useStudioB } from '../studio-b-context';
import {
  CARD_LABEL,
  NEXT_STEP_LABEL,
  PREVIOUS_STEP_LABEL,
  stepNumberOf,
  WITHOUT_PART,
} from '../studio-b-copy';
import { eightsOf, preciseRangeClockOf } from '../studio-b-format';
import { StudioBCardMedia } from './StudioBCardMedia';

interface StudioBCardProps {
  placement: KkStudioBManualCardPlacement;
  ref?: Ref<HTMLElement>;
}

export const StudioBCard: FC<StudioBCardProps> = ({ placement, ref }) => {
  const { practice } = useStudioB();
  const step = practice.current;

  if (step === null) {
    return null;
  }

  const partName = practice.currentPart?.name ?? WITHOUT_PART;
  const meta = `${partName} · ${preciseRangeClockOf(step.range)} · ${eightsOf(step.eights)}`;
  const aside = placement === 'aside';
  const previous = {
    label: PREVIOUS_STEP_LABEL,
    disabled: !practice.hasPrevious,
    onSelect: () => {
      practice.actions.move('previous');
    },
  };
  const next = {
    label: NEXT_STEP_LABEL,
    disabled: !practice.hasNext,
    onSelect: () => {
      practice.actions.move('next');
    },
  };
  const stepKey = String(step.stepId);

  return (
    <KkStudioBManual.Card label={CARD_LABEL} placement={placement} ref={ref}>
      <KkStudioBManual.Head
        stepKey={stepKey}
        number={stepNumberOf(step.number)}
        name={step.name}
        meta={meta}
        previous={previous}
        next={next}
      />
      <StudioBCardMedia step={step} aside={aside} fallbackName={partName} />
    </KkStudioBManual.Card>
  );
};
