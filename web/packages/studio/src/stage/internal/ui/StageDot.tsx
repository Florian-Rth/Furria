import type { KkStageInkDensity, KkStageInkDiscKind } from '@furria/ui/KkStageInk';
import { KkStageInk } from '@furria/ui/KkStageInk';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { StageEntrance } from '../layout/StagePlace';
import { StagePlace } from '../layout/StagePlace';

export type StageNameSide = 'below' | 'above' | 'none';

const layers: Record<KkStageInkDiscKind, number> = { open: 1, cast: 1, absent: 2, own: 3 };

interface StageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStageInkDiscKind;
  density?: KkStageInkDensity;
  muted?: boolean;
  moving?: boolean;
  turn?: number | null;
  name?: string | null;
  nameSide?: StageNameSide;
  glide?: boolean;
  from?: StageEntrance | null;
}

export const StageDot: FC<StageDotProps> = ({
  x,
  y,
  number,
  kind,
  density = 'full',
  muted = false,
  moving = false,
  turn = null,
  name = null,
  nameSide = 'none',
  glide = false,
  from = null,
}) => {
  const nameEdge = nameSide === 'above' ? { bottom: '100%' } : { top: '100%' };
  const nameTag =
    name === null || nameSide === 'none' ? null : (
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          py: 0.25,
          ...nameEdge,
        }}
      >
        <KkStageInk.Name name={name} absent={kind === 'absent'} />
      </Box>
    );

  return (
    <StagePlace x={x} y={y} layer={layers[kind]} glide={glide} from={from}>
      <Box data-kk-stage-dot={kind} sx={{ position: 'relative' }}>
        <KkStageInk.Disc
          kind={kind}
          density={density}
          number={number}
          muted={muted}
          moving={moving}
          turn={turn}
        />
        {nameTag}
      </Box>
    </StagePlace>
  );
};
