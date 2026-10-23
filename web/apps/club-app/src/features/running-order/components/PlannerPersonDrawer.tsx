import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { CLOSE_LABEL } from '../planner-copy';
import { PlannerPersonHead } from './PlannerPersonHead';
import { PlannerPersonTimeline } from './PlannerPersonTimeline';

export const PlannerPersonDrawer: FC = () => {
  const planner = usePlanner();
  const timeline = planner.person;
  const body =
    timeline === null ? null : (
      <Stack sx={{ gap: 1.5, px: 2.5, pb: 3, minWidth: 0 }}>
        <PlannerPersonHead timeline={timeline} />
        <PlannerPersonTimeline timeline={timeline} />
      </Stack>
    );

  const open = !planner.isWide && timeline !== null;
  const label = timeline?.person.firstName ?? '';

  return (
    <KkBottomDrawer
      open={open}
      label={label}
      closeLabel={CLOSE_LABEL}
      onClose={planner.closePerson}
    >
      {body}
    </KkBottomDrawer>
  );
};
