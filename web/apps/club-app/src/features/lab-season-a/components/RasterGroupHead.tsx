import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GROUP_HEIGHT } from '../raster-geometry';
import { toGroupHead } from '../season-a-copy';
import type { RasterGroupRow } from '../season-raster';

interface RasterGroupHeadProps {
  row: RasterGroupRow;
}

export const RasterGroupHead: FC<RasterGroupHeadProps> = ({ row }) => {
  const head = toGroupHead(row.name, row.count);

  return (
    <Stack sx={{ height: GROUP_HEIGHT, minWidth: 0 }}>
      <Stack
        direction="row"
        role="heading"
        aria-level={2}
        sx={{ flex: 1, alignItems: 'center', gap: 0.75, pb: 0.75, minWidth: 0 }}
      >
        <KkGroupToneDot tone={row.tone} />
        <KkMeta tone="accent" lines={1}>
          {head}
        </KkMeta>
      </Stack>
      <KkRule weight="hair" />
    </Stack>
  );
};
