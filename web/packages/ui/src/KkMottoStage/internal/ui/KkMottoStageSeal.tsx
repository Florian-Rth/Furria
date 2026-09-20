import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkSeal } from '../../../KkSeal';
import type { KkSx } from '../../../kk-sx';

interface KkMottoStageSealProps {
  dateLabel: string;
  caption: string;
  sx?: KkSx;
}

export const KkMottoStageSeal: FC<KkMottoStageSealProps> = ({ dateLabel, caption, sx }) => (
  <Box
    data-kk-motto-stage-seal
    sx={[{ flexShrink: 0, alignSelf: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkSeal dateLabel={dateLabel} caption={caption} />
  </Box>
);
