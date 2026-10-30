import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { HALL_AREA_WIDE } from '../hall-query';

export type KkHallKeyGroupFlow = 'row' | 'column' | 'auto';

const KEY_ROW_HEIGHT = '4.25rem';
const LEAD_TRACK = 'minmax(0, 1.5fr)';

const leadTracks: Record<KkHallKeyGroupFlow, CSSObject> = {
  row: { gridTemplateColumns: LEAD_TRACK },
  column: { gridTemplateRows: LEAD_TRACK },
  auto: {
    gridTemplateRows: LEAD_TRACK,
    [HALL_AREA_WIDE]: { gridTemplateRows: 'none', gridTemplateColumns: LEAD_TRACK },
  },
};

const flows: Record<KkHallKeyGroupFlow, CSSObject> = {
  row: { gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)', minHeight: KEY_ROW_HEIGHT },
  column: { gridAutoFlow: 'row', gridAutoRows: 'minmax(0, 1fr)' },
  auto: {
    gridAutoFlow: 'row',
    gridAutoRows: 'minmax(0, 1fr)',
    [HALL_AREA_WIDE]: { gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)' },
  },
};

interface KkHallKeyGroupProps extends PropsWithChildren {
  flow: KkHallKeyGroupFlow;
  lead?: boolean;
}

export const KkHallKeyGroup: FC<KkHallKeyGroupProps> = ({ flow, lead = false, children }) => (
  <Box
    role="group"
    sx={[
      { display: 'grid', gap: { xs: 1, desktop: 1.5 }, width: '100%', height: '100%' },
      flows[flow],
      lead ? leadTracks[flow] : null,
    ]}
  >
    {children}
  </Box>
);
