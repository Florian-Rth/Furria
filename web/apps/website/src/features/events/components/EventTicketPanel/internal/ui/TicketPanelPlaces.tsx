import { kkTokens } from '@furria/ui/tokens';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { PresalePlaceList } from '@/features/events/components/PresalePlaceList';
import {
  type PresalePlacesView,
  presalePlacesHeadingOf,
} from '@/features/events/presale-places-display';

const PLACES_HEADING_ID = 'vorverkaufsstellen-panel-titel';

interface TicketPanelPlacesProps {
  presalePlaces: PresalePlacesView;
}

export const TicketPanelPlaces: FC<TicketPanelPlacesProps> = ({ presalePlaces }) => {
  const heading = presalePlacesHeadingOf(presalePlaces.opensAt);

  return (
    <Stack
      component="section"
      aria-labelledby={PLACES_HEADING_ID}
      sx={{
        gap: 2,
        alignSelf: 'stretch',
        pt: 2,
        borderTop: kkTokens.line.hair,
        borderColor: 'divider',
      }}
    >
      <Typography id={PLACES_HEADING_ID} variant="subtitle2" component="h2">
        {heading}
      </Typography>
      <PresalePlaceList places={presalePlaces.places} />
    </Stack>
  );
};
