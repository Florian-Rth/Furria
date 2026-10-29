import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStudioBDotRole } from '../studio-b-dot';
import { discPaint, STAGE_TURN } from './studio-b-stage-paint';

const UPRIGHT = 'rotate(0deg)';
const UPSIDE_DOWN = 'rotate(180deg)';

interface KkStudioBStageDiscProps {
  number: number;
  role: KkStudioBDotRole;
  turned: boolean;
}

export const KkStudioBStageDisc: FC<KkStudioBStageDiscProps> = ({ number, role, turned }) => (
  <Box component="span" data-kk-studio-b-dot={role} sx={discPaint(role)}>
    <Box
      component="span"
      sx={{ transform: turned ? UPSIDE_DOWN : UPRIGHT, transition: STAGE_TURN }}
    >
      {number}
    </Box>
  </Box>
);
