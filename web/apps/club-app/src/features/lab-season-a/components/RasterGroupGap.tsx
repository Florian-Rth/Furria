import { KkRule } from '@furria/ui/KkRule';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GROUP_HEIGHT } from '../raster-geometry';

export const RasterGroupGap: FC = () => (
  <Stack aria-hidden sx={{ height: GROUP_HEIGHT, justifyContent: 'flex-end', minWidth: 0 }}>
    <KkRule weight="hair" />
  </Stack>
);
