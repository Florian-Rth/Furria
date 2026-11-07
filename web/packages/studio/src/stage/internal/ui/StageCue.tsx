import type { KkStageInkCueSide, KkStageInkCueTone } from '@furria/ui/KkStageInk';
import { KkStageInk } from '@furria/ui/KkStageInk';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { placeOf } from '../../stage-framing';

const CUE_LAYER = 4;

interface StageCueProps {
  x: number;
  y: number;
  text: string;
  tone: KkStageInkCueTone;
  side: KkStageInkCueSide;
}

export const StageCue: FC<StageCueProps> = ({ x, y, text, tone, side }) => (
  <Box
    style={placeOf(x, y)}
    sx={{ position: 'absolute', left: 0, top: 0, zIndex: CUE_LAYER, height: 0 }}
  >
    <KkStageInk.Cue text={text} tone={tone} side={side} />
  </Box>
);
