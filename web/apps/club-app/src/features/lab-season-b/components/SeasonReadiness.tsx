import { KkOverlapGauge } from '@furria/ui/KkOverlapGauge';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { Readiness } from '@/features/season/season-grid';
import { toReadinessLabel } from '../season-b-copy';
import { NARROW_COLUMN } from '../season-layout';

export type SeasonReadinessPlace = 'side' | 'below';

interface SeasonReadinessProps {
  name: string;
  readiness: Readiness;
  place?: SeasonReadinessPlace;
}

const PLACE_SX = {
  side: { display: 'inline-flex', [NARROW_COLUMN]: { display: 'none' } },
  below: { display: 'none', [NARROW_COLUMN]: { display: 'inline-flex' } },
} as const;

export const SeasonReadiness: FC<SeasonReadinessProps> = ({ name, readiness, place = 'side' }) => {
  const label = toReadinessLabel(name, readiness);
  const tone = readiness.ready ? 'ink' : 'accent';

  return (
    <Box component="span" sx={PLACE_SX[place]}>
      <KkOverlapGauge shared={readiness.done} total={readiness.total} label={label} tone={tone} />
    </Box>
  );
};
