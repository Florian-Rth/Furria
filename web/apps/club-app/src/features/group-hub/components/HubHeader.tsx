import { KkChip, KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
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

  const chipRow =
    headline.chips.length === 0 ? null : (
      <KkScreenHeader.Meta>
        {headline.chips.map((chip) => (
          <KkChip key={chip.label} tone={chip.tone} dot={chip.dot}>
            {chip.label}
          </KkChip>
        ))}
      </KkScreenHeader.Meta>
    );

  const subline = headline.subline === null ? null : <KkMeta>{headline.subline}</KkMeta>;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        {eyebrow}
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {chipRow}
        {subline}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
