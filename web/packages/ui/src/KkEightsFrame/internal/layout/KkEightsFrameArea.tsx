import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export type KkEightsFrameAreaName = 'bar' | 'main' | 'side' | 'foot';

interface KkEightsFrameAreaProps extends PropsWithChildren {
  area: KkEightsFrameAreaName;
}

export const KkEightsFrameArea: FC<KkEightsFrameAreaProps> = ({ area, children }) => (
  <Stack
    data-kk-eights-area={area}
    sx={{
      gridArea: area,
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      gap: 1,
    }}
  >
    {children}
  </Stack>
);
