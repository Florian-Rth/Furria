import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNumberField } from '@furria/ui/KkNumberField';
import type { FC } from 'react';
import type { SeatingSettings } from '../hooks/use-seating-settings';
import type { StandardFields } from '../planner-settings';
import {
  AISLE_FIELD_LABEL,
  CHAIR_DEPTH_FIELD_LABEL,
  COMFORTABLE_FIELD_LABEL,
  EXIT_FIELD_LABEL,
  MAXIMUM_FIELD_LABEL,
  STANDARD_INVALID,
  STANDARD_SAVE_LABEL,
  STANDARD_SECTION_TITLE,
  STEP_LABELS,
} from '../table-planner-copy';

const MIN_CM = 10;
const MAX_CM = 500;

const FIELDS: readonly { key: keyof StandardFields; label: string }[] = [
  { key: 'comfortable', label: COMFORTABLE_FIELD_LABEL },
  { key: 'maximum', label: MAXIMUM_FIELD_LABEL },
  { key: 'depth', label: CHAIR_DEPTH_FIELD_LABEL },
  { key: 'aisle', label: AISLE_FIELD_LABEL },
  { key: 'exit', label: EXIT_FIELD_LABEL },
];

interface TablePlannerStandardFormProps {
  settings: SeatingSettings;
}

export const TablePlannerStandardForm: FC<TablePlannerStandardFormProps> = ({ settings }) => {
  const fields = FIELDS.map((field) => {
    const change = (value: string): void => {
      settings.changeStandard(field.key, value);
    };

    return (
      <KkNumberField
        key={field.key}
        name={field.key}
        label={field.label}
        value={settings.standard[field.key]}
        onChange={change}
        stepLabels={STEP_LABELS}
        min={MIN_CM}
        max={MAX_CM}
      />
    );
  });
  const invalid = settings.standardValid ? null : <KkMeta tone="accent">{STANDARD_INVALID}</KkMeta>;

  return (
    <KkFormSection title={STANDARD_SECTION_TITLE}>
      {fields}
      <KkButton
        variant="outlined"
        onClick={settings.saveStandard}
        disabled={!settings.standardValid}
        loading={settings.savingStandard}
      >
        {STANDARD_SAVE_LABEL}
      </KkButton>
      {invalid}
    </KkFormSection>
  );
};
