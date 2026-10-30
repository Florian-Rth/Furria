import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHall } from '@furria/ui/KkHall';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useClockFace } from '../hooks/use-clock-face';
import type { HeuteA } from '../hooks/use-heute-a';

interface HeuteClockLiveProps {
  heute: HeuteA;
}

const NO_NEXT_LINE = null;

export const HeuteClockLive: FC<HeuteClockLiveProps> = ({ heute }) => {
  const face = useClockFace(heute);

  return (
    <>
      <KkHall.Area area="count">
        <Stack sx={{ height: '100%', alignItems: 'center', gap: 0.5, pt: 6, minHeight: 0 }}>
          <Box sx={{ flex: 1, width: '100%', minHeight: 0, py: 1 }}>
            <KkHall.Count count={face.count} leading={false} label={face.label} />
          </Box>
          <KkEyebrow tone="muted">{face.title}</KkEyebrow>
        </Stack>
      </KkHall.Area>
      <KkHall.Area area="step">
        <KkHall.Step name={heute.stepName} meta={face.stepMeta} next={NO_NEXT_LINE} />
      </KkHall.Area>
    </>
  );
};
