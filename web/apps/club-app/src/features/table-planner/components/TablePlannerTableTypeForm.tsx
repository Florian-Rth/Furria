import { KkButton } from '@furria/ui/KkButton';
import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { LABEL_MAX_LENGTH } from '@/features/hall-plan/schemas';
import type { SeatingSettings } from '../hooks/use-seating-settings';
import { isTableShape } from '../planner-facts';
import {
  SHAPE_LABELS,
  STEP_LABELS,
  TYPE_CANCEL_LABEL,
  TYPE_DIAMETER_LABEL,
  TYPE_ENDS_LABEL,
  TYPE_INVALID,
  TYPE_LENGTH_LABEL,
  TYPE_NAME_LABEL,
  TYPE_SAVE_LABEL,
  TYPE_SHAPE_LABEL,
  TYPE_WIDTH_LABEL,
} from '../table-planner-copy';

const MIN_CM = 30;
const MAX_CM = 1000;

const SHAPES: readonly KkChoiceChip[] = [
  { id: 'rectangle', label: SHAPE_LABELS.rectangle },
  { id: 'round', label: SHAPE_LABELS.round },
];

interface TablePlannerTableTypeFormProps {
  settings: SeatingSettings;
}

export const TablePlannerTableTypeForm: FC<TablePlannerTableTypeFormProps> = ({ settings }) => {
  const fields = settings.typeFields;
  const isRound = fields.shape === 'round';
  const lengthLabel = isRound ? TYPE_DIAMETER_LABEL : TYPE_LENGTH_LABEL;
  const changeName = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    settings.changeType({ name: event.target.value });
  };
  const changeShape = (id: string): void => {
    if (isTableShape(id)) {
      settings.changeType({ shape: id });
    }
  };
  const changeLength = (value: string): void => {
    settings.changeType({ length: value });
  };
  const changeWidth = (value: string): void => {
    settings.changeType({ width: value });
  };
  const changeEnds = (checked: boolean): void => {
    settings.changeType({ seatsAtEnds: checked });
  };
  const shapeChips = (
    <KkChoiceChips
      label={TYPE_SHAPE_LABEL}
      choices={SHAPES}
      value={fields.shape}
      onChange={changeShape}
    />
  );
  const width = isRound ? null : (
    <KkNumberField
      name="widthCm"
      label={TYPE_WIDTH_LABEL}
      value={fields.width}
      onChange={changeWidth}
      stepLabels={STEP_LABELS}
      min={MIN_CM}
      max={MAX_CM}
    />
  );
  const ends = isRound ? null : (
    <KkCheckboxRow label={TYPE_ENDS_LABEL} checked={fields.seatsAtEnds} onChange={changeEnds} />
  );
  const invalid = settings.typeValid ? null : <KkMeta tone="accent">{TYPE_INVALID}</KkMeta>;

  return (
    <Stack sx={{ rowGap: 1.5, py: 1 }}>
      <KkTextField
        name="name"
        label={TYPE_NAME_LABEL}
        value={fields.name}
        maxLength={LABEL_MAX_LENGTH}
        onChange={changeName}
      />
      <KkFieldRow label={TYPE_SHAPE_LABEL} value={shapeChips} />
      <KkNumberField
        name="lengthCm"
        label={lengthLabel}
        value={fields.length}
        onChange={changeLength}
        stepLabels={STEP_LABELS}
        min={MIN_CM}
        max={MAX_CM}
      />
      {width}
      {ends}
      {invalid}
      <Stack direction="row" sx={{ columnGap: 1 }}>
        <KkButton
          onClick={settings.saveType}
          disabled={!settings.typeValid}
          loading={settings.savingType}
        >
          {TYPE_SAVE_LABEL}
        </KkButton>
        <KkButton variant="text" onClick={settings.cancelType}>
          {TYPE_CANCEL_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
