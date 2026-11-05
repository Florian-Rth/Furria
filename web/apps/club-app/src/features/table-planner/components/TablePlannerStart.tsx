import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { EventDetails } from '@/features/events/schemas';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { useTablePlannerStart } from '../hooks/use-table-planner-start';
import {
  START_DRAW_LABEL,
  START_HALLS_TITLE,
  START_LOADING_LABEL,
  START_NO_HALLS_NOTE,
  START_NO_HALLS_TITLE,
  START_NO_VENUE_NOTE,
} from '../table-planner-copy';
import { TablePlannerCopySources } from './TablePlannerCopySources';
import { TablePlannerHallChoices } from './TablePlannerHallChoices';

interface TablePlannerStartProps {
  eventId: number;
  event: EventDetails;
}

export const TablePlannerStart: FC<TablePlannerStartProps> = ({ eventId, event }) => {
  const start = useTablePlannerStart(eventId, event);

  if (start.isLoading) {
    return <AppListSkeleton label={START_LOADING_LABEL} listShape="rows" />;
  }

  const drawButton = start.canDraw ? (
    <KkButton
      variant="outlined"
      onClick={start.drawHall}
      loading={start.isBusy}
      startIcon={<KkIcon name="wall" size="small" />}
    >
      {START_DRAW_LABEL}
    </KkButton>
  ) : (
    <KkNote>{START_NO_VENUE_NOTE}</KkNote>
  );
  const halls =
    start.halls.length === 0 ? (
      <KkEmptyState
        title={START_NO_HALLS_TITLE}
        description={START_NO_HALLS_NOTE}
        action={drawButton}
      />
    ) : (
      <KkPanelSection title={START_HALLS_TITLE}>
        <Stack sx={{ rowGap: 1.5 }}>
          <TablePlannerHallChoices
            halls={start.halls}
            disabled={start.isBusy}
            onChoose={start.chooseHall}
          />
          {drawButton}
        </Stack>
      </KkPanelSection>
    );
  const copies =
    start.copySources.length === 0 ? null : (
      <TablePlannerCopySources
        sources={start.copySources}
        disabled={start.isBusy}
        onChoose={start.copyFrom}
      />
    );

  return (
    <Stack sx={{ rowGap: 3, width: '100%' }}>
      {halls}
      {copies}
    </Stack>
  );
};
