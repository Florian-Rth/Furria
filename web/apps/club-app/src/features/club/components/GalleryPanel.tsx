import { KkAlbumShelf, KkButton, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useNewestAlbumsShelf } from '@/features/gallery';
import { GALLERY_PATH, GALLERY_TITLE } from '@/features/session';

const SHELF_ALBUMS = 4;
const ALL_ALBUMS_LABEL = 'Alle Alben';

export const GalleryPanel: FC = () => {
  const albums = useNewestAlbumsShelf(SHELF_ALBUMS);

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
