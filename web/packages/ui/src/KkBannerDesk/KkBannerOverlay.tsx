import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkBannerOverlayProps extends PropsWithChildren {
  placement: 'center' | 'upper' | 'corner' | 'foot';
}

const PLACEMENTS = {
  center: { inset: 0, alignItems: 'center', justifyContent: 'center' },
  upper: { inset: 0, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'center' },
  corner: { bottom: 8, right: 8, alignItems: 'center', justifyContent: 'flex-end' },
  foot: { left: 0, right: 0, bottom: 0, alignItems: 'stretch', justifyContent: 'flex-end' },
} as const;

export const KkBannerOverlay: FC<KkBannerOverlayProps> = ({ placement, children }) => (
  <Stack
    direction={placement === 'foot' ? 'column' : 'row'}
    sx={{
      position: 'absolute',
      zIndex: 1,
      gap: 1,
      flexWrap: 'wrap',
      p: placement === 'corner' ? 0 : 1.5,
      ...PLACEMENTS[placement],
    }}
  >
    {children}
  </Stack>
);
