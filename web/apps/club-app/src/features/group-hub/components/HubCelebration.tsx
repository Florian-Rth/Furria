import { KkConfettiBurst } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

const PERSON_MARK_LANE = 26;

interface HubCelebrationProps {
  fireKey: number;
}

export const HubCelebration: FC<HubCelebrationProps> = ({ fireKey }) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: 0,
      width: PERSON_MARK_LANE,
      pointerEvents: 'none',
    }}
  >
    <KkConfettiBurst fireKey={fireKey} />
  </Box>
);
