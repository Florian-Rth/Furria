import { KkAppShell, KkChip, KkEyebrow, KkMeta } from '@furria/ui';
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
    headline.eyebrow === null ? null : <KkEyebrow tone="accent">{headline.eyebrow}</KkEyebrow>;

  const opennessChip =
    headline.openness === null ? null : (
      <KkChip tone={headline.openness.tone} dot={headline.openness.dot}>
        {headline.openness.label}
      </KkChip>
    );

  const subline = headline.subline === null ? null : <KkMeta>{headline.subline}</KkMeta>;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      {eyebrow}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
      >
        <KkAppShell.PageTitle>{headline.title}</KkAppShell.PageTitle>
        {opennessChip}
      </Stack>
      {subline}
    </Stack>
  );
};
