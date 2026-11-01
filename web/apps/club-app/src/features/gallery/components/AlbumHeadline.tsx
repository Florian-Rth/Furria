import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { EDIT_LABEL, photographersLine, UPLOAD_HERE_LABEL } from '../album-labels';
import { ALBUM_EDIT_ROUTE, GALLERY_UPLOAD_PATH } from '../gallery-copy';
import type { AlbumRights } from '../hooks/use-album';
import type { AlbumDetails } from '../schemas';

interface AlbumHeadlineProps {
  albumId: number;
  album: AlbumDetails;
  rights: AlbumRights;
}

const uploadIcon = <KkIcon name="upload" size="small" />;
const editIcon = <KkIcon name="edit" size="small" />;

export const AlbumHeadline: FC<AlbumHeadlineProps> = ({ albumId, album, rights }) => {
  const params = { albumId: String(albumId) };
  const photographers = photographersLine(album);
  const uploadSearch = { album: albumId };
  const credits =
    photographers === null ? null : (
      <KkText variant="caption" tone="secondary">
        {photographers}
      </KkText>
    );
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
      {credits}
      {description}
      {tools}
    </Stack>
  );
};
