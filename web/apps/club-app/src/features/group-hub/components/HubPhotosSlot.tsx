import { KkMeta, KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HUB_SECTION_TITLES } from '../group-hub-labels';
import { HubSection } from './HubSection';

const PHOTO_KEYS = ['first', 'second', 'third', 'fourth'] as const;
const PHOTO_LABEL = 'gruppen-foto';
const PHOTOS_NOTE =
  'Platz für Bilder aus euren Sessions. Die Galerie liefert sie später automatisch — hier wird nichts hochgeladen.';

export const HubPhotosSlot: FC = () => (
  <HubSection title={HUB_SECTION_TITLES.photos}>
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Grid container spacing={1.5} sx={{ minWidth: 0 }}>
        {PHOTO_KEYS.map((key) => (
          <Grid key={key} size={6} sx={{ minWidth: 0 }}>
            <KkPhotoPlaceholder label={PHOTO_LABEL} aspectRatio={kkTokens.aspectRatio.banner} />
          </Grid>
        ))}
      </Grid>
      <KkMeta>{PHOTOS_NOTE}</KkMeta>
    </Stack>
  </HubSection>
);
