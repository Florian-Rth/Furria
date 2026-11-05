import { KkNumberField } from '@furria/ui/KkNumberField';
import type { FC } from 'react';
import { STEP_LESS_LABEL, STEP_MORE_LABEL } from '../hall-builder-copy';
import type { MeasureBounds } from '../hall-measure-text';
import { useMeasureDraft } from '../hooks/use-measure-draft';

const STEP_LABELS = { less: STEP_LESS_LABEL, more: STEP_MORE_LABEL };

interface HallMeasureFieldProps {
  name: string;
  label: string;
  value: number;
  bounds: MeasureBounds;
  onCommit: (value: number) => void;
}

export const HallMeasureField: FC<HallMeasureFieldProps> = ({
  name,
  label,
  value,
  bounds,
  onCommit,
}) => {
  const draft = useMeasureDraft(value, bounds, onCommit);

  return (
    <KkNumberField
      name={name}
      label={label}
      value={draft.text}
      onChange={draft.change}
      stepLabels={STEP_LABELS}
      min={bounds.min}
      max={bounds.max}
      error={draft.isInvalid}
    />
  );
};
