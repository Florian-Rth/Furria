import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { CLOSE_LABEL } from '../planner-copy';
import { PlannerRowDetail } from './PlannerRowDetail';
import { PlannerRowDetailHead } from './PlannerRowDetailHead';

export const PlannerRowDrawer: FC = () => {
  const planner = usePlanner();
  const line =
    planner.draft.lines.find((candidate) => candidate.key === planner.selectedKey) ?? null;
  const open = !planner.isWide && line !== null && planner.person === null;
  const body =
    line === null ? null : (
      <Stack sx={{ gap: 2, px: 2.5, pb: 3, minWidth: 0 }}>
        <PlannerRowDetailHead line={line} />
        <PlannerRowDetail line={line} />
      </Stack>
    );

  return (
    <KkBottomDrawer
      open={open}
      label={line?.act.name ?? ''}
      closeLabel={CLOSE_LABEL}
      onClose={planner.closeSelection}
    >
      {body}
    </KkBottomDrawer>
  );
};
