import { KkButton, KkFilmEdge, KkFrame } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  NO_SESSION_NOTE,
  PUBLISH_LABEL,
  PUBLISHED_MARK,
  SELECTION_TITLE,
  UNPUBLISHED_MARK,
  WITHDRAW_LABEL,
} from '../gallery-copy';
import type { LabAlbumSpec, LabItem } from '../lab-gallery-data';
import { labSourceOf } from '../lab-gallery-data';

interface GallerySelectionShelfProps {
  album: LabAlbumSpec;
  selection: readonly LabItem[];
  onOpen: (number: number) => void;
}

const stateOf = (album: LabAlbumSpec): string => {
  if (album.sessionId === null) {
    return NO_SESSION_NOTE;
  }
  return album.published ? PUBLISHED_MARK : UNPUBLISHED_MARK;
};

export const GallerySelectionShelf: FC<GallerySelectionShelfProps> = ({
  album,
  selection,
  onOpen,
}) => {
  const publishLabel = album.published ? WITHDRAW_LABEL : PUBLISH_LABEL;
  const publishVariant = album.published ? 'outlined' : 'contained';
  const cannotPublish = album.sessionId === null || selection.length === 0;
  const frames = selection.map((item) => (
    <Grid key={item.id} size={{ xs: 2, desktop: 1 }}>
      <KkFrame
        label={`${SELECTION_TITLE} ${item.selection ?? ''}, Bild ${item.number}`}
        source={labSourceOf(item.photo)}
        mark={{ kind: 'selection', order: item.selection ?? 0 }}
        onSelect={() => onOpen(item.number)}
      />
    </Grid>
  ));

  return (
    <Stack component="section" aria-label={SELECTION_TITLE} sx={{ rowGap: 0.75 }}>
      <Stack direction="row" sx={{ alignItems: 'center', columnGap: 1 }}>
        <KkFilmEdge
          lead={`${SELECTION_TITLE} · ${selection.length}`}
          meta={stateOf(album)}
          tone="gold"
          level="h2"
          sx={{ flex: 1 }}
        />
        <KkButton size="small" variant={publishVariant} disabled={cannotPublish}>
          {publishLabel}
        </KkButton>
      </Stack>
      <Grid container spacing={0.25}>
        {frames}
      </Grid>
    </Stack>
  );
};
