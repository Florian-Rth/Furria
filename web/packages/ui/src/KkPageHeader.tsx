import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { KkAppShell } from './KkAppShell/KkAppShell';
import type { KkSx } from './kk-sx';

export type KkPageHeaderTransform = 'uppercase' | 'none';

interface KkPageHeaderProps {
  title: string;
  eyebrow?: ReactNode;
  avatar?: ReactNode;
  chip?: ReactNode;
  subline?: ReactNode;
  titleTransform?: KkPageHeaderTransform;
  sx?: KkSx;
}

export const KkPageHeader: FC<KkPageHeaderProps> = ({
  title,
  eyebrow,
  avatar,
  chip,
  subline,
  titleTransform = 'uppercase',
  sx,
}) => (
  <Stack
    direction="row"
    data-kk-page-header
    sx={[
      { alignItems: 'center', gap: { xs: 1.75, desktop: 2.5 }, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {avatar}
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      {eyebrow}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
      >
        <KkAppShell.PageTitle transform={titleTransform}>{title}</KkAppShell.PageTitle>
        {chip}
      </Stack>
      {subline}
    </Stack>
  </Stack>
);
