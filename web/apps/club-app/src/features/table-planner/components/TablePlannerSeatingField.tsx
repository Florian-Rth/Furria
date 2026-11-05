import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import type { FC } from 'react';
import type { Seating } from '@/features/hall-plan/schemas';
import { isSeating } from '../planner-facts';
import { SEATING_FIELD_LABEL, SEATING_LABELS, SEATING_PLAN_DEFAULT } from '../table-planner-copy';

const PLAN_DEFAULT = 'plan';

const CHOICES: readonly KkChoiceChip[] = [
  { id: PLAN_DEFAULT, label: SEATING_PLAN_DEFAULT },
  { id: 'comfortable', label: SEATING_LABELS.comfortable },
  { id: 'maximum', label: SEATING_LABELS.maximum },
];

interface TablePlannerSeatingFieldProps {
  seating: Seating | null;
  onChange: (seating: Seating | null) => void;
}

export const TablePlannerSeatingField: FC<TablePlannerSeatingFieldProps> = ({
  seating,
  onChange,
}) => {
  const change = (id: string): void => {
    onChange(isSeating(id) ? id : null);
  };

  const chips = (
    <KkChoiceChips
      label={SEATING_FIELD_LABEL}
      choices={CHOICES}
      value={seating ?? PLAN_DEFAULT}
      onChange={change}
    />
  );

  return <KkFieldRow label={SEATING_FIELD_LABEL} value={chips} />;
};
