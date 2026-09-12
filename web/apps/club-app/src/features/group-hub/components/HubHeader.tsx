import { KkChip, KkEyebrow, KkMeta, KkPageHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
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
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
        {headline.chips.map((chip) => (
          <KkChip key={chip.label} tone={chip.tone} dot={chip.dot}>
            {chip.label}
          </KkChip>
        ))}
      </Stack>
    );

  const subline = headline.subline === null ? null : <KkMeta>{headline.subline}</KkMeta>;

  return (
    <KkPageHeader
      title={headline.title}
      titleTransform="none"
      eyebrow={eyebrow}
      chip={chipRow}
      subline={subline}
    />
  );
};
