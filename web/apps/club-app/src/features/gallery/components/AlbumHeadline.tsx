import { KkButton, KkFilmEdge, KkIcon, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  albumDateLine,
  albumMetaLine,
  EDIT_LABEL,
  scenesTrail,
  UPLOAD_HERE_LABEL,
} from '../album-labels';
import { ALBUM_EDIT_ROUTE, GALLERY_UPLOAD_PATH } from '../gallery-copy';
import type { AlbumRights } from '../hooks/use-album';
import type { AlbumDetails } from '../schemas';

interface AlbumHeadlineProps {
  albumId: number;
  album: AlbumDetails;
  scenes: number;
  rights: AlbumRights;
}

const uploadIcon = <KkIcon name="upload" size="small" />;
const editIcon = <KkIcon name="edit" size="small" />;

export const AlbumHeadline: FC<AlbumHeadlineProps> = ({ albumId, album, scenes, rights }) => {
  const params = { albumId: String(albumId) };
  const lead = albumDateLine(album);
  const meta = albumMetaLine(album);
  const trail = scenesTrail(scenes);
  const uploadSearch = { album: albumId };
  const description =
    album.description === null ? null : (
      <KkText variant="body2" tone="secondary">
        {album.description}
      </KkText>
    );
  const upload = rights.uploads ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={uploadIcon}
      component={Link}
      to={GALLERY_UPLOAD_PATH}
      search={uploadSearch}
    >
      {UPLOAD_HERE_LABEL}
    </KkButton>
  ) : null;
  const edit = rights.managesItems ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={editIcon}
      component={Link}
      to={ALBUM_EDIT_ROUTE}
      params={params}
    >
      {EDIT_LABEL}
    </KkButton>
  ) : null;
  const tools =
    upload === null && edit === null ? null : (
      <Stack direction="row" sx={{ columnGap: 1, flexWrap: 'wrap', rowGap: 1 }}>
        {upload}
        {edit}
      </Stack>
    );

  return (
    <Stack sx={{ rowGap: 1 }}>
      <KkFilmEdge lead={lead} meta={meta} trail={trail} level="h2" />
      {description}
      {tools}
    </Stack>
  );
};
