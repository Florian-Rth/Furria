import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  EMPTY_DESCRIPTION,
  EMPTY_TITLE,
  FILTERED_EMPTY_DESCRIPTION,
  FILTERED_EMPTY_TITLE,
  UPLOAD_HERE_LABEL,
} from '../album-labels';
import { GALLERY_UPLOAD_PATH } from '../gallery-copy';

interface AlbumEmptyProps {
  albumId: number;
  filtered: boolean;
  uploads: boolean;
}

export const AlbumEmpty: FC<AlbumEmptyProps> = ({ albumId, filtered, uploads }) => {
  const search = { album: albumId };
  const upload = uploads ? (
    <KkButton component={Link} to={GALLERY_UPLOAD_PATH} search={search}>
      {UPLOAD_HERE_LABEL}
    </KkButton>
  ) : undefined;

  if (filtered) {
    return <KkEmptyState title={FILTERED_EMPTY_TITLE} description={FILTERED_EMPTY_DESCRIPTION} />;
  }

  return <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} action={upload} />;
};
