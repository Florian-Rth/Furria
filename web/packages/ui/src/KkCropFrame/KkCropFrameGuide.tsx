import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../tokens';

const VEIL_REACH = '0 0 0 100vmax';

export const KkCropFrameGuide: FC = () => (
  <Box
    aria-hidden
    data-kk-crop-frame-guide
    sx={{
      position: 'absolute',
      left: 0,
      top: '50%',
      width: '100%',
      aspectRatio: '1',
      transform: 'translateY(-50%)',
      borderRadius: '50%',
      borderWidth: kkTokens.line.hair,
      borderStyle: 'dashed',
      borderColor: kkTokens.crop.guide,
      boxShadow: `${VEIL_REACH} ${kkTokens.crop.veil}`,
      pointerEvents: 'none',
    }}
  />
);
