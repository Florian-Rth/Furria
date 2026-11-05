import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import type { FC } from 'react';
import type { Seating } from '@/features/hall-plan/schemas';
import { isSeating } from '../planner-facts';
import { SEATING_FIELD_LABEL, SEATING_LABELS } from '../table-planner-copy';

const CHOICES: readonly KkChoiceChip[] = [
  { id: 'comfortable', label: SEATING_LABELS.comfortable },
  { id: 'maximum', label: SEATING_LABELS.maximum },
];

interface TablePlannerPlanSeatingProps {
  seating: Seating;
  onChange: (seating: Seating) => void;
}

export const TablePlannerPlanSeating: FC<TablePlannerPlanSeatingProps> = ({
  seating,
  onChange,
}) => {
  const change = (id: string): void => {
    if (isSeating(id)) {
      onChange(id);
    }
  };
  const chips = (
    <KkChoiceChips
      label={SEATING_FIELD_LABEL}
      choices={CHOICES}
      value={seating}
      onChange={change}
    />
  );

  return <KkFieldRow label={SEATING_FIELD_LABEL} value={chips} />;
};
