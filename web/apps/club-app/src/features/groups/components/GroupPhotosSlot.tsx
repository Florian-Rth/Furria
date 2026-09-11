import { KkMeta, KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '../groups-labels';
import { GroupSection } from './GroupSection';

const PHOTO_KEYS = ['first', 'second', 'third', 'fourth'] as const;
const PHOTO_LABEL = 'gruppen-foto';
const PHOTOS_NOTE =
  'Platz für ein paar Bilder aus vergangenen Sessions. Die Galerie liefert sie später automatisch — hier wird nichts hochgeladen.';

export const GroupPhotosSlot: FC = () => (
  <GroupSection title={GROUP_SECTION_TITLES.photos}>
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
  </GroupSection>
);
