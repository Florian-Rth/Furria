import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioListRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioListRoot: FC<KkStudioListRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-kk-studio-list
    sx={{
      width: '100%',
      height: '100%',
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      gap: 0.5,
      p: { xs: 0.5, desktop: 1 },
    }}
  >
    {children}
  </Stack>
);
