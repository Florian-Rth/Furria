import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useClubHubQuery } from '../api';
import type { ClubBoardSeat } from '../schemas';
import { BoardSeatCard } from './BoardSeatCard';

const PANEL_TITLE = 'Wer macht was';
const BAND_SPACING = { xs: 2, desktop: 2.5 };
const SEAT_SIZE = { xs: 6, sm: 4, desktop: 3 };

const toSeatKey = (seat: ClubBoardSeat): string => `${seat.sortOrder}-${seat.person.personId}`;

export const BoardPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const board = clubHub.data?.board ?? [];

  if (board.length === 0) {
    return null;
  }

  const seats = board.map((seat) => (
    <Grid key={toSeatKey(seat)} size={SEAT_SIZE} sx={{ minWidth: 0 }}>
      <BoardSeatCard seat={seat} />
    </Grid>
  ));

  return (
    <KkPanelSection title={PANEL_TITLE}>
      <Grid container spacing={BAND_SPACING} sx={{ minWidth: 0 }}>
        {seats}
      </Grid>
    </KkPanelSection>
  );
};
