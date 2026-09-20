import { KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useClubHubQuery } from '../api';
import { KeyHoldersSheet } from './KeyHoldersSheet';
import { KeyVenueTile } from './KeyVenueTile';

const KEY_PANEL_TITLE = 'Schlüssel';
const KEY_PANEL_DESCRIPTION = 'Wen du fragst, wenn aufgeschlossen werden muss';
const TILE_SIZE = { xs: 6, sm: 4, desktop: 3 };
const TILE_SPACING = { xs: 1.5, desktop: 2 };
const FULL_HEIGHT = { height: '100%' } as const;

export const KeyPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const venues = clubHub.data?.venues;

  if (venues === undefined || venues.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={KEY_PANEL_TITLE} description={KEY_PANEL_DESCRIPTION}>
      <Grid container spacing={TILE_SPACING} sx={{ minWidth: 0 }}>
        {venues.map((venue) => (
          <Grid key={venue.venueId} size={TILE_SIZE} sx={{ minWidth: 0 }}>
            <KeyVenueTile venue={venue} sx={FULL_HEIGHT} />
          </Grid>
        ))}
      </Grid>
      <KeyHoldersSheet venues={venues} />
    </KkPanelSection>
  );
};
