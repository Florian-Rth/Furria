import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_HUB_HELP_SPOTS } from '@/features/gallery/gallery-hub-help-copy';
import { useUploadLinksHubEntry } from '../hooks/use-upload-links-hub-entry';
import { LINKS_PATH, LINKS_TITLE } from '../upload-link-copy';

export const UploadLinksHubEntry: FC = () => {
  const entry = useUploadLinksHubEntry();

  if (entry === null) {
    return null;
  }

  return (
    <KkPanel landing={GALLERY_HUB_HELP_SPOTS.links}>
      <KkHubRow
        label={LINKS_TITLE}
        icon="link"
        meta={entry.meta}
        component={Link}
        to={LINKS_PATH}
      />
    </KkPanel>
  );
};
