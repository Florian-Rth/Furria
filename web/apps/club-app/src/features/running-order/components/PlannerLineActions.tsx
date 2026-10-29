import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import {
  PARK_LABEL,
  PIN_SHORT_LABEL,
  PLACE_LABEL,
  REMOVE_SHORT_LABEL,
  UNBRACKET_SHORT_LABEL,
  UNPIN_SHORT_LABEL,
} from '../planner-copy';

interface PlannerLineActionsProps {
  line: DraftLine;
}

export const PlannerLineActions: FC<PlannerLineActionsProps> = ({ line }) => {
  const planner = usePlanner();
  const togglePin = (): void => {
    planner.togglePinOf(line.key);
  };
  const dissolve = (): void => {
    planner.dissolve(line.key);
  };
  const place = (): void => {
    planner.place(line.key);
  };
  const unplace = (): void => {
    planner.unplaceLine(line.key);
  };
  const drop = (): void => {
    planner.closeSelection();
    planner.drop(line.key);
  };
  const pin = line.placed ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name={line.pinned ? 'pinFilled' : 'pin'} size="small" />}
      onClick={togglePin}
    >
      {line.pinned ? UNPIN_SHORT_LABEL : PIN_SHORT_LABEL}
    </KkButton>
  ) : (
    <KkButton size="small" variant="contained" onClick={place}>
      {PLACE_LABEL}
    </KkButton>
  );
  const block =
    line.blockKey === null ? null : (
      <KkButton
        size="small"
        variant="outlined"
        startIcon={<KkIcon name="unblock" size="small" />}
        onClick={dissolve}
      >
        {UNBRACKET_SHORT_LABEL}
      </KkButton>
    );
  const park = line.placed ? (
    <KkButton size="small" variant="text" onClick={unplace}>
      {PARK_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack
      direction="row"
      sx={{ flexWrap: 'wrap', alignItems: 'center', columnGap: 0.75, rowGap: 1, minWidth: 0 }}
    >
      {pin}
      {block}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, ml: 'auto' }}>
        {park}
        <KkButton size="small" variant="text" tone="danger" onClick={drop}>
          {REMOVE_SHORT_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
