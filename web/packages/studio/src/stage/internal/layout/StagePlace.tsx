import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { placeOf } from '../../stage-framing';
import { StageEntering } from './StageEntering';

export interface StageEntrance {
  x: number;
  y: number;
  delay: number;
}

const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)';

interface StagePlaceProps extends PropsWithChildren {
  x: number;
  y: number;
  layer: number;
  glide?: boolean;
  from?: StageEntrance | null;
}

export const StagePlace: FC<StagePlaceProps> = ({
  x,
  y,
  layer,
  glide = false,
  from = null,
  children,
}) => {
  const transition = glide ? GLIDE : 'none';
  const willChange = glide ? 'transform' : 'auto';
  const content =
    from === null ? (
      children
    ) : (
      <StageEntering x={x} y={y} from={from}>
        {children}
      </StageEntering>
    );

  return (
    <Box
      style={placeOf(x, y)}
      sx={{ position: 'absolute', left: 0, top: 0, zIndex: layer, willChange, transition }}
    >
      {content}
    </Box>
  );
};
