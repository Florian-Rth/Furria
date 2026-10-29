import { KkStudioBManual } from '@furria/ui/KkStudioBManual';
import type { FC, Ref } from 'react';
import { useStudioB } from '../studio-b-context';
import {
  LOOSE_NOTE,
  stepLabelOf,
  stepNumberOf,
  stepsCountOf,
  WITHOUT_PART,
} from '../studio-b-copy';
import { eightsOf, rangeClockOf } from '../studio-b-format';
import type { ManualEntry } from '../studio-b-manual';
import { StudioBCard } from './StudioBCard';

interface StudioBManualEntryProps {
  entry: ManualEntry;
  ref?: Ref<HTMLElement>;
}

export const StudioBManualEntry: FC<StudioBManualEntryProps> = ({ entry, ref }) => {
  const { playback, practice } = useStudioB();

  switch (entry.kind) {
    case 'part': {
      const { part } = entry;
      const meta = `${rangeClockOf(part.range)} · ${stepsCountOf(part.steps.length)} · ${eightsOf(part.eights)}`;

      return (
        <KkStudioBManual.Part
          ref={ref}
          name={part.name ?? WITHOUT_PART}
          meta={meta}
          current={entry.current}
        />
      );
    }
    case 'step': {
      const { step } = entry;
      const range = rangeClockOf(step.range);
      const formation = {
        widthMetres: playback.stage.widthMetres,
        depthMetres: playback.stage.depthMetres,
        dots: step.formation,
      };
      const select = (): void => {
        practice.actions.practise(step.stepId);
      };

      return (
        <KkStudioBManual.Step
          ref={ref}
          number={stepNumberOf(step.number)}
          name={step.name}
          range={range}
          eights={eightsOf(step.eights)}
          label={stepLabelOf(step.number, step.name, range)}
          hasVideo={step.hasVideo}
          formation={formation}
          current={entry.current}
          onSelect={select}
        />
      );
    }
    case 'card':
      return <StudioBCard ref={ref} placement="inList" />;
    case 'loose':
      return <KkStudioBManual.Loose ref={ref} name={entry.step.name} note={LOOSE_NOTE} />;
  }
};
