import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';

export const KkStudioGInspectorBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-g-inspector-body
    sx={{
      flex: 1,
      minHeight: 0,
      gap: 1.25,
      px: 1.5,
      pb: 1.5,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      animation: 'kk-studio-g-swap-in 220ms ease-out both',
      '@keyframes kk-studio-g-swap-in': {
        from: { opacity: 0, transform: 'translateY(0.375rem)' },
        to: { opacity: 1, transform: 'none' },
      },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      [STUDIO_G_WIDE]: { px: 2, pb: 2, gap: 2 },
    }}
  >
    {children}
  </Stack>
);
