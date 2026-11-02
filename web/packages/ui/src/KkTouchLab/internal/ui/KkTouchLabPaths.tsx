import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export interface KkTouchLabPath {
  key: string;
  d: string;
  active: boolean;
}

interface KkTouchLabPathsProps {
  paths: readonly KkTouchLabPath[];
}

export const KkTouchLabPaths: FC<KkTouchLabPathsProps> = ({ paths }) => (
  <Box
    component="svg"
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      '& path': {
        fill: 'none',
        stroke: touchLabPalette(theme).text.secondary,
        strokeWidth: kkTokens.line.section,
        strokeDasharray: '6 5',
        strokeLinecap: 'round',
      },
      '& path[data-active="true"]': {
        stroke: touchLabPalette(theme).primary.main,
        strokeWidth: kkTokens.line.page,
        strokeDasharray: 'none',
      },
    })}
  >
    {paths.map((path) => (
      <path key={path.key} data-active={path.active} d={path.d} />
    ))}
  </Box>
);
