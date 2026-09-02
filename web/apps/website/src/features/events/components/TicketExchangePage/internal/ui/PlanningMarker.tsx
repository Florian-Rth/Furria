import { kkTokens } from '@furria/ui';
import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { exchangeHeroContent } from '@/features/events/exchange-content';

interface PlanningMarkerProps {
  sx?: SxProps<Theme>;
}

export const PlanningMarker: FC<PlanningMarkerProps> = ({ sx }) => (
  <Chip
    variant="outlined"
    color="primary"
    size="small"
    label={exchangeHeroContent.planningMarker}
    data-kk-planning-marker
    sx={[
      { borderStyle: 'dashed', letterSpacing: kkTokens.eyebrow.letterSpacing, fontWeight: 700 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
