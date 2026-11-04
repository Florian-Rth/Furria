import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { HallOption } from '../planner-start';
import { toHallMeta } from '../table-planner-copy';

interface TablePlannerHallChoicesProps {
  halls: readonly HallOption[];
  disabled: boolean;
  onChoose: (hallId: number) => void;
}

export const TablePlannerHallChoices: FC<TablePlannerHallChoicesProps> = ({
  halls,
  disabled,
  onChoose,
}) => {
  const rows = halls.map((hall) => {
    const choose = (): void => {
      if (!disabled) {
        onChoose(hall.hallId);
      }
    };

    return (
      <KkSelectRow
        key={hall.hallId}
        title={hall.name}
        meta={toHallMeta(hall.venueName, hall.isEventVenue)}
        dimmed={disabled}
        onClick={choose}
      />
    );
  });

  return <Stack>{rows}</Stack>;
};
