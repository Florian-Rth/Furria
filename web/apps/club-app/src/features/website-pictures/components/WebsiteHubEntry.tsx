import { KkHubRow, KkPanel } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useWebsiteHubEntry } from '../hooks/use-website-hub-entry';
import { WEBSITE_PATH, WEBSITE_TITLE } from '../website-copy';

export const WebsiteHubEntry: FC = () => {
  const entry = useWebsiteHubEntry();

  if (entry === null) {
    return null;
  }

  return (
    <KkPanel>
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
