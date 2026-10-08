import { KkFilmEdge, KkFlapCount } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { FREE_TITLE, SESSION_WORD } from '../gallery-copy';
import type { HubSection } from '../gallery-view';
import { countLabel, countsLine } from '../gallery-view';
import { GalleryAlbumStrip } from './GalleryAlbumStrip';

interface GallerySessionSectionProps {
  section: HubSection;
  order: number;
  showsSelection: boolean;
  onOpen: (albumId: string, photo?: number) => void;
}

const FLAP_STEP_SECONDS = 0.12;

export const GallerySessionSection: FC<GallerySessionSectionProps> = ({
  section,
  order,
  showsSelection,
  onOpen,
}) => {
  const lead = section.session === null ? FREE_TITLE : SESSION_WORD;
  const numeral =
    section.session === null ? null : (
      <KkFlapCount
        value={section.session.label}
        variant="h2"
        delaySeconds={order * FLAP_STEP_SECONDS}
        tone="red"
      />
    );
  const meta = `${countLabel(section.albums.length)} Alben · ${countsLine(section.counts)}`;
  const strips = section.albums.map((entry) => (
    <Grid key={entry.album.id} size={{ xs: 12, desktop: 6 }}>
      <GalleryAlbumStrip entry={entry} showsSelection={showsSelection} onOpen={onOpen} />
    </Grid>
  ));

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
