import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkConfettiBurst } from '../../../KkConfettiBurst';
import { KkSeal } from '../../../KkSeal';

const SEAL_SIZE = { xs: 88, desktop: 116 };
const SEAL_ROTATION = -9;
const PLACEMENT = { top: '8%', right: '5%' };
const BURST_COUNT = 18;

interface KkGroupStageJubileeSealProps {
  yearsLabel: string;
  caption: string;
  fireKey: number;
}

export const KkGroupStageJubileeSeal: FC<KkGroupStageJubileeSealProps> = ({
  yearsLabel,
  caption,
  fireKey,
}) => (
  <Box
    data-kk-group-stage-jubilee
    sx={{ position: 'absolute', ...PLACEMENT, zIndex: 2, pointerEvents: 'none' }}
  >
    <Box sx={{ position: 'relative', display: { xs: 'block', desktop: 'none' } }}>
      <KkSeal
        dateLabel={yearsLabel}
        caption={caption}
        size={SEAL_SIZE.xs}
        rotation={SEAL_ROTATION}
      />
      <KkConfettiBurst fireKey={fireKey} count={BURST_COUNT} />
    </Box>
    <Box sx={{ position: 'relative', display: { xs: 'none', desktop: 'block' } }}>
      <KkSeal
        dateLabel={yearsLabel}
        caption={caption}
        size={SEAL_SIZE.desktop}
        rotation={SEAL_ROTATION}
      />
      <KkConfettiBurst fireKey={fireKey} count={BURST_COUNT} />
    </Box>
  </Box>
);
