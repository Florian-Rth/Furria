import { KkChip, KkEyebrow, KkMeta, KkPageHeader } from '@furria/ui';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { toHubHeadline } from '../group-hub-labels';
import type { HubDetails } from '../schemas';

interface HubHeaderProps {
  hub: HubDetails | undefined;
}

export const HubHeader: FC<HubHeaderProps> = ({ hub }) => {
  const me = useMeQuery();
  const headline = toHubHeadline(hub, me.data?.person.id ?? null);

  const eyebrow =
    headline.eyebrow === null ? null : (
      <KkEyebrow tone="accent" size="small">
        {headline.eyebrow}
      </KkEyebrow>
    );

  const opennessChip =
    headline.openness === null ? null : (
      <KkChip tone={headline.openness.tone} dot={headline.openness.dot}>
        {headline.openness.label}
      </KkChip>
    );

  const subline = headline.subline === null ? null : <KkMeta>{headline.subline}</KkMeta>;

  return (
    <KkPageHeader
      title={headline.title}
      titleTransform="none"
      eyebrow={eyebrow}
      chip={opennessChip}
      subline={subline}
    />
  );
};
