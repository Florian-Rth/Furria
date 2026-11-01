import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useUploadLinksHubEntry } from '../hooks/use-upload-links-hub-entry';
import { LINKS_PATH, LINKS_TITLE } from '../upload-link-copy';

export const UploadLinksHubEntry: FC = () => {
  const entry = useUploadLinksHubEntry();

  if (entry === null) {
    return null;
  }

  return (
    <KkPanel>
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
