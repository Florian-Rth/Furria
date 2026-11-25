import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_HUB_HELP_SPOTS } from '@/features/gallery/gallery-hub-help-copy';
import { useWebsiteHubEntry } from '../hooks/use-website-hub-entry';
import { WEBSITE_PATH, WEBSITE_TITLE } from '../website-copy';

export const WebsiteHubEntry: FC = () => {
  const entry = useWebsiteHubEntry();

  if (entry === null) {
    return null;
  }

  return (
    <KkPanel landing={GALLERY_HUB_HELP_SPOTS.website}>
      <KkHubRow
        label={WEBSITE_TITLE}
        icon="image"
        meta={entry.meta}
        component={Link}
        to={WEBSITE_PATH}
      />
    </KkPanel>
  );
};
