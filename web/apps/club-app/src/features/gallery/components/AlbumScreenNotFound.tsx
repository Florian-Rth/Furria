import { KkButton, KkEmptyState, KkScreen } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_ORIGIN, GALLERY_PATH } from '@/features/session';

const NOT_FOUND_TITLE = 'ALBUM NICHT GEFUNDEN';
const NOT_FOUND_DESCRIPTION = 'Das Album gibt es nicht mehr oder es liegt im Papierkorb.';
const BACK_LABEL = 'Zur Galerie';

export const AlbumScreenNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={GALLERY_ORIGIN.label} origin={GALLERY_ORIGIN}>
    <KkEmptyState
      title={NOT_FOUND_TITLE}
      description={NOT_FOUND_DESCRIPTION}
      action={
        <KkButton variant="outlined" component={Link} to={GALLERY_PATH}>
          {BACK_LABEL}
        </KkButton>
      }
    />
  </KkScreen>
);
