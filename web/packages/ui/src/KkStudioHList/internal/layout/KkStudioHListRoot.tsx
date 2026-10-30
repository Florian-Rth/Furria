import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioHListRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioHListRoot: FC<KkStudioHListRootProps> = ({ label, children }) => (
  <Stack
    role="list"
    aria-label={label}
    data-kk-studio-h-list
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
