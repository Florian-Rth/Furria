import { KkHall } from '@furria/ui/KkHall';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { SCREEN_LABEL } from '../heute-c-copy';
import { HEUTE_GRID } from '../heute-c-layout';
import { useHeuteC } from '../hooks/use-heute-c';
import { HeuteCAblauf } from './HeuteCAblauf';
import { HeuteCAblaufBar } from './HeuteCAblaufBar';
import { HeuteCAblaufDrawer } from './HeuteCAblaufDrawer';
import { HeuteCCalls } from './HeuteCCalls';
import { HeuteCCentre } from './HeuteCCentre';
import { HeuteCHead } from './HeuteCHead';
import { HeuteCKeys } from './HeuteCKeys';
import { HeuteCSlot } from './HeuteCSlot';

interface HeuteCPageProps {
  eventId: string;
}

export const HeuteCPage: FC<HeuteCPageProps> = ({ eventId }) => {
  const heute = useHeuteC(eventId);

  return (
    <KkHall label={SCREEN_LABEL}>
      <Box component="main" sx={HEUTE_GRID}>
        <HeuteCSlot area="head">
          <HeuteCHead heute={heute} />
        </HeuteCSlot>
        <HeuteCSlot area="list">
          <HeuteCAblauf entries={heute.entries} currentIndex={heute.currentIndex} />
        </HeuteCSlot>
        <HeuteCSlot area="bar">
          <HeuteCAblaufBar heute={heute} />
        </HeuteCSlot>
        <HeuteCSlot area="centre">
          <HeuteCCentre heute={heute} />
        </HeuteCSlot>
        <HeuteCSlot area="keys">
          <HeuteCKeys heute={heute} />
        </HeuteCSlot>
        <HeuteCSlot area="call">
          <HeuteCCalls heute={heute} />
        </HeuteCSlot>
      </Box>
      <HeuteCAblaufDrawer heute={heute} />
    </KkHall>
  );
};
