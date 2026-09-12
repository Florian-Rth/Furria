import { KkConfettiBurst } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const BURST_BAND_RATIO = '3 / 1';

interface HubCelebrationProps extends PropsWithChildren {
  fireKey: number;
}

export const HubCelebration: FC<HubCelebrationProps> = ({ fireKey, children }) => (
  <Stack sx={{ position: 'relative', minWidth: 0 }}>
    {children}
    <Stack
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        aspectRatio: BURST_BAND_RATIO,
        pointerEvents: 'none',
      }}
    >
      <KkConfettiBurst fireKey={fireKey} />
    </Stack>
  </Stack>
);
