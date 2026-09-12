import Grid from '@mui/material/Grid';
import type { FC, ReactNode } from 'react';

const SPACING = { xs: 3.5, desktop: 5 };

const SPLIT_SIZES = {
  about: { xs: 12, desktop: 7 },
  admins: { xs: 12, desktop: 5 },
  members: { xs: 12, desktop: 7 },
  history: { xs: 12, desktop: 12 },
  events: { xs: 12, desktop: 6 },
  photos: { xs: 12, desktop: 6 },
};

const STACKED_SIZES = {
  about: { xs: 12, desktop: 12 },
  admins: { xs: 12, desktop: 12 },
  members: { xs: 12, desktop: 12 },
  history: { xs: 12, desktop: 12 },
  events: { xs: 12, desktop: 12 },
  photos: { xs: 12, desktop: 12 },
};

const ORDERS = {
  about: { xs: 1, desktop: 1 },
  admins: { xs: 3, desktop: 2 },
  members: { xs: 2, desktop: 3 },
  history: { xs: 4, desktop: 5 },
  events: { xs: 5, desktop: 6 },
  photos: { xs: 6, desktop: 6 },
};

interface GroupDetailLayoutProps {
  about?: ReactNode;
  admins?: ReactNode;
  members?: ReactNode;
  history?: ReactNode;
  events?: ReactNode;
  photos?: ReactNode;
  stacked?: boolean;
}

export const GroupDetailLayout: FC<GroupDetailLayoutProps> = ({
  about,
  admins,
  members,
  history,
  events,
  photos,
  stacked = false,
}) => {
  const sizes = stacked ? STACKED_SIZES : SPLIT_SIZES;

  const aboutSlot =
    about === undefined ? null : (
      <Grid size={sizes.about} sx={{ minWidth: 0, order: ORDERS.about }}>
        {about}
      </Grid>
    );

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

  const eventsSlot =
    events === undefined ? null : (
      <Grid size={sizes.events} sx={{ minWidth: 0, order: ORDERS.events }}>
        {events}
      </Grid>
    );

  const photosSlot =
    photos === undefined ? null : (
      <Grid size={sizes.photos} sx={{ minWidth: 0, order: ORDERS.photos }}>
        {photos}
      </Grid>
    );

  return (
    <Grid container spacing={SPACING} sx={{ minWidth: 0 }}>
      {aboutSlot}
      {adminsSlot}
      {membersSlot}
      {historySlot}
      {eventsSlot}
      {photosSlot}
    </Grid>
  );
};
