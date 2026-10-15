import { KkButton, KkFilmEdge, KkFrame, KkMeta, KkRetryAlert } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toAlbumErrorMessage } from '../album-form-messages';
import { selectionOf } from '../album-frames';
import {
  SELECTION_EDIT_LABEL,
  SELECTION_EMPTY_NOTE,
  selectionFrameLabel,
  selectionLead,
  selectionState,
} from '../album-labels';
import { useAlbumQuery } from '../api';
import { ALBUM_SELECTION_ROUTE, GALLERY_RETRY_LABEL } from '../gallery-copy';
import { frameStateOf, shownSourceOf } from '../gallery-view';
import type { AlbumDetails } from '../schemas';

const UNFILTERED = { kind: null, uploaderPersonId: null };

interface AlbumSelectionShelfProps {
  albumId: number;
  album: AlbumDetails;
  onOpen: (id: number) => void;
}

export const AlbumSelectionShelf: FC<AlbumSelectionShelfProps> = ({ albumId, album, onOpen }) => {
  const full = useAlbumQuery(albumId, UNFILTERED);
  const selection = selectionOf(full.data?.items ?? album.items);
  const failure = full.data === undefined ? toAlbumErrorMessage(full.error) : null;
  const params = { albumId: String(albumId) };
  const reload = (): void => {
    void full.refetch();
  };
  const lead = selectionLead(selection.length);
  const state = selectionState(album);
  const tone = album.publishedAt === null ? 'muted' : 'gold';
  const frames = selection.map((item, index) => {
    const order = index + 1;
    const label = selectionFrameLabel(order, album.title);
    const source = shownSourceOf(item);
    const frameState = frameStateOf(item);
    const mark = { kind: 'selection', order } as const;
    const open = (): void => onOpen(item.mediaItemId);
    return (
      <Grid key={item.mediaItemId} size={{ xs: 2, desktop: 1 }}>
        <KkFrame label={label} source={source} state={frameState} mark={mark} onSelect={open} />
      </Grid>
    );
  });
  const loaded =
    selection.length === 0 ? (
      <KkMeta tone="muted">{SELECTION_EMPTY_NOTE}</KkMeta>
    ) : (
      <Grid container spacing={0.25}>
        {frames}
      </Grid>
    );
  const body =
    failure === null ? (
      loaded
    ) : (
      <KkRetryAlert
        message={failure}
        retrying={full.isFetching}
        onRetry={reload}
        retryLabel={GALLERY_RETRY_LABEL}
      />
    );

  return (
    <Stack component="section" aria-label={lead} sx={{ rowGap: 0.75 }}>
      <Stack direction="row" sx={{ alignItems: 'center', columnGap: 1 }}>
        <KkFilmEdge lead={lead} meta={state} tone={tone} level="h2" sx={{ flex: 1, minWidth: 0 }} />
        <KkButton
          size="small"
          variant="outlined"
          component={Link}
          to={ALBUM_SELECTION_ROUTE}
          params={params}
        >
          {SELECTION_EDIT_LABEL}
        </KkButton>
      </Stack>
      {body}
    </Stack>
  );
};
