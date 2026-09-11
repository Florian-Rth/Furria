import { KkConfettiBurst } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface HubCelebrationProps extends PropsWithChildren {
  fireKey: number;
}

export const HubCelebration: FC<HubCelebrationProps> = ({ fireKey, children }) => (
  <Stack sx={{ position: 'relative', minWidth: 0 }}>
    {children}
    <KkConfettiBurst fireKey={fireKey} />
  </Stack>
);
