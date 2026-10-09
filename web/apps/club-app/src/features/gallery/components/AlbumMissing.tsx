import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_PATH, GALLERY_TITLE } from '@/features/session';
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE } from '../album-labels';

const backToGallery = (
  <KkButton variant="outlined" component={Link} to={GALLERY_PATH}>
    {GALLERY_TITLE}
  </KkButton>
);

export const AlbumMissing: FC = () => (
  <KkEmptyState
    title={NOT_FOUND_TITLE}
    description={NOT_FOUND_DESCRIPTION}
    action={backToGallery}
  />
);
