import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { ABLAUF_TITLE, DRAWER_CLOSE } from '../heute-c-copy';
import type { HeuteCState } from '../hooks/use-heute-c';
import { HeuteCAblauf } from './HeuteCAblauf';

interface HeuteCAblaufDrawerProps {
  heute: HeuteCState;
}

export const HeuteCAblaufDrawer: FC<HeuteCAblaufDrawerProps> = ({ heute }) => (
  <KkBottomDrawer
    open={heute.isAblaufOpen}
    label={ABLAUF_TITLE}
    closeLabel={DRAWER_CLOSE}
    onClose={heute.closeAblauf}
  >
    <Box sx={{ px: 2, pb: 3, height: '60dvh', minHeight: 0, display: 'grid' }}>
      <HeuteCAblauf entries={heute.entries} currentIndex={heute.currentIndex} />
    </Box>
  </KkBottomDrawer>
);
