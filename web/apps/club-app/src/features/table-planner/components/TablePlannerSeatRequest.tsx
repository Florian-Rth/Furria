import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkPlanStatusStrip } from '@furria/ui/KkPlanStatusStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ROW_COUNT_MAX, ROW_COUNT_MIN } from '@/features/hall-plan/schemas';
import { SEATS_MAX, SEATS_MIN } from '@/features/hall-plan/seat-request';
import { useSeatRequestForm } from '../hooks/use-seat-request-form';
import {
  COUNT_STEP_LABELS,
  SEAT_SHAPE_LABEL,
  SEATS_FIELD_LABEL,
  SEATS_HINT,
  STEP_LABELS,
  TABLES_PER_ROW_LABEL,
} from '../table-planner-copy';

export const TablePlannerSeatRequest: FC = () => {
  const form = useSeatRequestForm();
  const perRow = form.showsTablesPerRow ? (
    <KkNumberField
      name="tablesPerRow"
      label={TABLES_PER_ROW_LABEL}
      value={form.tablesPerRow}
      onChange={form.changeTablesPerRow}
      stepLabels={COUNT_STEP_LABELS}
      min={ROW_COUNT_MIN}
      max={ROW_COUNT_MAX}
    />
  ) : null;
  const offer =
    form.offer === null ? null : (
      <KkPlanStatusStrip label={SEATS_HINT}>
        <KkPlanStatusStrip.Chip
          label={form.offer}
          icon="chair"
          tone={form.isShort ? 'hint' : 'done'}
        />
      </KkPlanStatusStrip>
    );

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
      <KkNumberField
        name="seats"
        label={SEATS_FIELD_LABEL}
        value={form.seats}
        onChange={form.changeSeats}
        stepLabels={STEP_LABELS}
        min={SEATS_MIN}
        max={SEATS_MAX}
      />
      <KkChoiceChips
        label={SEAT_SHAPE_LABEL}
        choices={form.shapeChoices}
        value={form.shape}
        onChange={form.changeShape}
      />
      {perRow}
      {offer}
    </Stack>
  );
};
