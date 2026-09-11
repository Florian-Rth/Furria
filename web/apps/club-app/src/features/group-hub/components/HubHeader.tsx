import { KkAppShell, KkEyebrow, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toHubHeadline } from '../group-hub-labels';
import type { HubDetails } from '../schemas';

interface HubHeaderProps {
  hub: HubDetails | undefined;
}

export const HubHeader: FC<HubHeaderProps> = ({ hub }) => {
  const headline = toHubHeadline(hub);

  const eyebrow =
    headline.eyebrow === null ? null : <KkEyebrow tone="accent">{headline.eyebrow}</KkEyebrow>;

  const countLine = headline.countLine === null ? null : <KkMeta>{headline.countLine}</KkMeta>;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      {eyebrow}
      <KkAppShell.PageTitle>{headline.title}</KkAppShell.PageTitle>
      {countLine}
    </Stack>
  );
};
