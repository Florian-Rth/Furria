import Grid from '@mui/material/Grid';
import type { FC, ReactNode } from 'react';

const SPACING = { xs: 3.5, desktop: 5 };

const SPLIT_SIZES = {
  admins: { xs: 12, desktop: 5 },
  members: { xs: 12, desktop: 7 },
  history: { xs: 12, desktop: 12 },
};

const STACKED_SIZES = {
  admins: { xs: 12, desktop: 12 },
  members: { xs: 12, desktop: 12 },
  history: { xs: 12, desktop: 12 },
};

const ORDERS = {
  admins: { xs: 3, desktop: 2 },
  members: { xs: 2, desktop: 3 },
  history: { xs: 4, desktop: 5 },
};

interface GroupDetailLayoutProps {
  admins?: ReactNode;
  members?: ReactNode;
  history?: ReactNode;
  stacked?: boolean;
}

export const GroupDetailLayout: FC<GroupDetailLayoutProps> = ({
  admins,
  members,
  history,
  stacked = false,
}) => {
  const sizes = stacked ? STACKED_SIZES : SPLIT_SIZES;

  const adminsSlot =
    admins === undefined ? null : (
      <Grid size={sizes.admins} sx={{ minWidth: 0, order: ORDERS.admins }}>
        {admins}
      </Grid>
    );

  const membersSlot =
    members === undefined ? null : (
      <Grid size={sizes.members} sx={{ minWidth: 0, order: ORDERS.members }}>
        {members}
      </Grid>
    );

  const historySlot =
    history === undefined ? null : (
      <Grid size={sizes.history} sx={{ minWidth: 0, order: ORDERS.history }}>
        {history}
      </Grid>
    );

  return (
    <Grid container spacing={SPACING} sx={{ minWidth: 0 }}>
      {adminsSlot}
      {membersSlot}
      {historySlot}
    </Grid>
  );
};
