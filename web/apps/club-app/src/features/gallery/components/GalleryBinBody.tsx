import { KkAlert, KkEmptyState, KkFilmEdge } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { purgeCountdownOf } from '../bin-countdown';
import { countLabel } from '../gallery-view';
import type { GalleryBinControl } from '../hooks/use-gallery-bin';
import type { GalleryBin } from '../schemas';
import { GalleryBinAlbumCard } from './GalleryBinAlbumCard';
import { GalleryBinHeader } from './GalleryBinHeader';
import { GalleryBinItemGroup } from './GalleryBinItemGroup';

const EMPTY_TITLE = 'PAPIERKORB LEER';
const EMPTY_DESCRIPTION =
  'Gelöschte Alben, Fotos und Videos liegen hier 30 Tage, bevor sie endgültig verschwinden.';
const ALBUMS_LEAD = 'Alben';
const ITEMS_LEAD = 'Einzelne Bilder';
const ITEMS_META = 'Antippen wählt aus, unten wiederherstellen';
const ALBUM_SIZE = { xs: 6, sm: 4, desktop: 2 };

interface GalleryBinBodyProps {
  bin: GalleryBin;
  control: GalleryBinControl;
}

const summaryOf = (bin: GalleryBin): string =>
  `${countLabel(bin.albums.length)} Alben · ${countLabel(bin.items.length)} Bilder`;

export const GalleryBinBody: FC<GalleryBinBodyProps> = ({ bin, control }) => {
  if (bin.albums.length === 0 && bin.items.length === 0) {
    return <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />;
  }

  const summary = summaryOf(bin);
  const rejection = control.rejection === null ? null : <KkAlert>{control.rejection}</KkAlert>;
  const albumCards = bin.albums.map((album) => {
    const countdown = purgeCountdownOf(album.purgesAt, control.now);
    const isRestoring = control.restoringAlbumId === album.albumId;
    return (
      <Grid key={album.albumId} size={ALBUM_SIZE} sx={{ minWidth: 0 }}>
        <GalleryBinAlbumCard
          album={album}
          countdown={countdown}
          isRestoring={isRestoring}
          onRestore={control.restoreAlbum}
        />
      </Grid>
    );
  });
  const albumsLead = `${ALBUMS_LEAD} · ${countLabel(bin.albums.length)}`;
  const albums =
    bin.albums.length === 0 ? null : (
      <Stack component="section" sx={{ rowGap: 1.5 }}>
        <KkFilmEdge lead={albumsLead} tone="red" size="title" level="h2" />
        <Grid container spacing={2}>
          {albumCards}
        </Grid>
      </Stack>
    );
  const groups = control.groups.map((group) => (
    <GalleryBinItemGroup
      key={group.albumId}
      group={group}
      now={control.now}
      picked={control.picked}
      onToggle={control.toggle}
    />
  ));
  const itemsLead = `${ITEMS_LEAD} · ${countLabel(bin.items.length)}`;
  const items =
    bin.items.length === 0 ? null : (
      <Stack component="section" sx={{ rowGap: 2 }}>
        <KkFilmEdge lead={itemsLead} meta={ITEMS_META} tone="red" size="title" level="h2" />
        {groups}
      </Stack>
    );

  return (
    <Stack sx={{ rowGap: 3.5, pb: 4, minWidth: 0 }}>
      <GalleryBinHeader summary={summary} />
      {rejection}
      {albums}
      {items}
    </Stack>
  );
};
