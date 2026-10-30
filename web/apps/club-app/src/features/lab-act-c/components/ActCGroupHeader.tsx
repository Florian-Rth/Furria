import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupHub } from '@/features/group-hub/schemas';
import { toGroupHeaderLine } from '../act-c-copy';

interface ActCGroupHeaderProps {
  hub: GroupHub;
}

export const ActCGroupHeader: FC<ActCGroupHeaderProps> = ({ hub }) => {
  const line = toGroupHeaderLine(hub);

  return (
    <Stack component="header" sx={{ gap: 0.25, minWidth: 0 }}>
      <KkHeading level={2} component="h1">
        {hub.name}
      </KkHeading>
      <KkMeta>{line}</KkMeta>
    </Stack>
  );
};
