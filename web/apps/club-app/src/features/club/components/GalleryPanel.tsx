import { KkAlbumShelf } from '@furria/ui/KkAlbumShelf';
import { KkButton } from '@furria/ui/KkButton';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGalleryHubQuery } from '@/features/gallery/api';
import { useNewestAlbumsShelf } from '@/features/gallery/hooks/use-newest-albums-shelf';
import { toHubErrorMessage } from '@/features/gallery/hub-copy';
import { GALLERY_PATH, GALLERY_TITLE } from '@/features/session/app-sections';
import { CLUB_RETRY_LABEL } from '../club-labels';

const SHELF_ALBUMS = 4;
const ALL_ALBUMS_LABEL = 'Alle Alben';

export const GalleryPanel: FC = () => {
  const albums = useNewestAlbumsShelf(SHELF_ALBUMS);
  const hub = useGalleryHubQuery();
  const errorMessage = toHubErrorMessage(hub.error);

  const retry = (): void => {
    void hub.refetch();
  };

  if (albums === undefined && errorMessage !== null) {
    return (
      <KkPanelSection title={GALLERY_TITLE}>
        <KkRetryAlert
          message={errorMessage}
          retrying={hub.isFetching}
          onRetry={retry}
          retryLabel={CLUB_RETRY_LABEL}
        />
      </KkPanelSection>
    );
  }
  if (albums === undefined || albums.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={GALLERY_TITLE}>
      <Stack sx={{ rowGap: 1.5 }}>
        <KkAlbumShelf albums={albums} />
        <KkButton variant="outlined" fullWidth component={Link} to={GALLERY_PATH}>
          {ALL_ALBUMS_LABEL}
        </KkButton>
      </Stack>
    </KkPanelSection>
  );
};
