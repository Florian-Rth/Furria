import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeAreaInset } from '../../../internal/safe-area';

export const KkStudioDPlayerStageArea: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-d-stage-area
    sx={{
      position: 'absolute',
      top: { xs: `calc(${safeAreaInset('top')} + 7rem)`, desktop: '5rem' },
      bottom: { xs: `calc(${safeAreaInset('bottom')} + 12rem)`, desktop: '13rem' },
      left: { xs: `calc(${safeAreaInset('left')} + 1rem)`, desktop: '19rem' },
      right: { xs: `calc(${safeAreaInset('right')} + 1rem)`, desktop: '19rem' },
      alignItems: 'center',
      justifyContent: 'center',
      containerType: 'size',
    }}
  >
    {children}
  </Stack>
);
