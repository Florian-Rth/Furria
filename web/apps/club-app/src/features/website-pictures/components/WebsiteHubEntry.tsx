import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { useWebsiteHubEntry } from '../hooks/use-website-hub-entry';
import { HUB_TITLE_LABEL, HUB_TRAIL, WEBSITE_TITLE } from '../website-copy';

export const WebsiteHubEntry: FC = () => {
  const entry = useWebsiteHubEntry();

  if (entry === null) {
    return null;
  }

  return (
    <KkContactStrip
      title={WEBSITE_TITLE}
      titleLabel={HUB_TITLE_LABEL}
      meta={entry.meta}
      trail={HUB_TRAIL}
      tone="gold"
      frames={entry.frames}
      onOpen={entry.open}
    />
  );
};
