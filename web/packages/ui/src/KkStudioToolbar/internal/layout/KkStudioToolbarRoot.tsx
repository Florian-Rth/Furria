import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioToolbarRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioToolbarRoot: FC<KkStudioToolbarRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-studio-toolbar
    sx={{
      width: '100%',
      minWidth: 0,
      flexShrink: 0,
      containerType: 'inline-size',
      alignItems: 'center',
      gap: 0.5,
      px: { xs: 1, desktop: 1.5 },
      pt: { xs: 0.75, desktop: 1.25 },
    }}
  >
    {children}
  </Stack>
);
