import { KkFilmEdge, KkFlapCount } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { FREE_TITLE, SESSION_WORD } from '../gallery-copy';
import { countLabel, countsLine, sessionLabel } from '../gallery-view';
import { albumMarkOf, sectionCountsOf } from '../hub-view';
import type { GallerySection } from '../schemas';
import { GalleryAlbumStrip } from './GalleryAlbumStrip';

const FLAP_STEP_SECONDS = 0.12;

interface GallerySessionSectionProps {
  section: GallerySection;
  order: number;
  showsSelection: boolean;
  now: Date;
  onOpen: (albumId: number, photo?: number) => void;
}

const metaOf = (section: GallerySection): string => {
  const albums = `${countLabel(section.albums.length)} ${section.albums.length === 1 ? 'Album' : 'Alben'}`;
  const counts = `${albums} · ${countsLine(sectionCountsOf(section.albums))}`;
  return section.sessionNumber === null ? counts : `Nr. ${section.sessionNumber} · ${counts}`;
};

export const GallerySessionSection: FC<GallerySessionSectionProps> = ({
  section,
  order,
  showsSelection,
  now,
  onOpen,
}) => {
  const lead = section.sessionStartYear === null ? FREE_TITLE : SESSION_WORD;
  const session = section.sessionStartYear === null ? null : sessionLabel(section.sessionStartYear);
  const meta = metaOf(section);
  const numeral =
    session === null ? null : (
      <KkFlapCount
        value={session}
        variant="h2"
        delaySeconds={order * FLAP_STEP_SECONDS}
        tone="red"
      />
    );
  const strips = section.albums.map((album) => {
    const mark = albumMarkOf(album, now, showsSelection);
    return (
      <Grid key={album.albumId} size={{ xs: 12, desktop: 6 }}>
        <GalleryAlbumStrip album={album} mark={mark} onOpen={onOpen} />
      </Grid>
    );
  });

  return (
    <Stack component="section" sx={{ rowGap: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1, minWidth: 0 }}>
        <KkFilmEdge lead={lead} size="title" level="h2" tone="red" />
        {numeral}
        <KkFilmEdge lead="" meta={meta} sx={{ flex: 1 }} />
      </Stack>
      <Grid container spacing={2}>
        {strips}
      </Grid>
    </Stack>
  );
};
