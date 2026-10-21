import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const SIDE = { flexShrink: 0, ml: 'auto' } as const;

export const KkCountHeadSide: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-count-head-side sx={SIDE}>
    {children}
  </Stack>
);
