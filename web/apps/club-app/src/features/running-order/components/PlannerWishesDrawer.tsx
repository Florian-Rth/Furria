import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { CLOSE_LABEL, WISHES_TITLE } from '../planner-copy';
import { PlannerWishBoard } from './PlannerWishBoard';

export const PlannerWishesDrawer: FC = () => {
  const planner = usePlanner();
  const open = planner.wishesOpen && !planner.isWide && planner.mode === 'order';

  return (
    <KkBottomDrawer
      open={open}
      label={WISHES_TITLE}
      closeLabel={CLOSE_LABEL}
      onClose={planner.closeWishes}
    >
      <Stack sx={{ px: 2.5, pb: 3, minWidth: 0 }}>
        <PlannerWishBoard />
      </Stack>
    </KkBottomDrawer>
  );
};
