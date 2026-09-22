import type { KkPanelAction } from '@furria/ui';
import { KkPanelSection, useKkSheetCommands } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useClubHubQuery } from '../api';
import type { ClubBoardSeat } from '../schemas';
import { BoardSeatCard } from './BoardSeatCard';
import { CLUB_ROLES_SHEET_ID, RolesSheet } from './RolesSheet';

const PANEL_TITLE = 'Wer macht was';
const ROLES_LABEL = 'Alle Rollen';
const BAND_SPACING = { xs: 2, desktop: 2.5 };
const SEAT_SIZE = { xs: 6, sm: 4, desktop: 3 };

const toSeatKey = (seat: ClubBoardSeat): string => `${seat.sortOrder}-${seat.person.personId}`;

export const BoardPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const sheet = useKkSheetCommands();
  const board = clubHub.data?.board ?? [];

  const openRoles = (): void => {
    sheet.open(CLUB_ROLES_SHEET_ID);
  };

  if (board.length === 0) {
    return null;
  }

  const action: KkPanelAction = { label: ROLES_LABEL, emphasis: 'quiet', onClick: openRoles };

  const seats = board.map((seat) => (
    <Grid key={toSeatKey(seat)} size={SEAT_SIZE} sx={{ minWidth: 0 }}>
      <BoardSeatCard seat={seat} />
    </Grid>
  ));

  return (
    <KkPanelSection title={PANEL_TITLE} action={action}>
      <Grid container spacing={BAND_SPACING} sx={{ minWidth: 0 }}>
        {seats}
      </Grid>
      <RolesSheet />
    </KkPanelSection>
  );
};
