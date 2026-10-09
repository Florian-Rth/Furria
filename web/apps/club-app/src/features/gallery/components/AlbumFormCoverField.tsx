import { KkButton, KkFieldRow, KkFrame } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AUTOMATIC_COVER } from '../album-form';
import { thumbSourceOf } from '../gallery-view';
import type { AlbumFormControl } from '../hooks/use-album-form';
import type { AlbumDetails } from '../schemas';

const COVER_LABEL = 'Titelbild';
const AUTOMATIC_LINE = 'Automatisch: das erste Foto der Auswahl, sonst das erste des Albums.';
const CHOSEN_LINE = 'Von Hand gewählt.';
const CHOOSE_LABEL = 'Wählen';

interface AlbumFormCoverFieldProps {
  album: AlbumDetails;
  control: AlbumFormControl;
}

const coverIdOf = (album: AlbumDetails, cover: string): number | null =>
  cover === AUTOMATIC_COVER ? album.coverMediaItemId : Number(cover);

export const AlbumFormCoverField: FC<AlbumFormCoverFieldProps> = ({ album, control }) => {
  const coverId = coverIdOf(album, control.values.cover);
  const cover = album.items.find((item) => item.mediaItemId === coverId);
  const source = cover === undefined ? undefined : thumbSourceOf(cover.urls);
  const line = control.values.cover === AUTOMATIC_COVER ? AUTOMATIC_LINE : CHOSEN_LINE;

  return (
    <Grid container spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Grid size={{ xs: 4, sm: 3 }}>
        <KkFrame label={COVER_LABEL} source={source} latentLabel={COVER_LABEL} />
      </Grid>
      <Grid size={{ xs: 8, sm: 9 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ rowGap: 1, alignItems: 'flex-start' }}>
          <KkFieldRow label={COVER_LABEL} value={line} />
          <KkButton size="small" variant="outlined" onClick={control.openCoverSheet}>
            {CHOOSE_LABEL}
          </KkButton>
        </Stack>
      </Grid>
    </Grid>
  );
};
