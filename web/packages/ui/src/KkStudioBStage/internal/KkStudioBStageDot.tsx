import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStudioBDot } from '../studio-b-dot';
import { KkStudioBStageDisc } from './KkStudioBStageDisc';
import { notchPaint } from './studio-b-stage-paint';

const DOT_SIZE = 'clamp(1.375rem, 6.4%, 2rem)';

const LANE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  willChange: 'transform',
} as const;

const SEAT = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: DOT_SIZE,
  aspectRatio: '1',
  transform: 'translate(-50%, -50%)',
} as const;

const OWN_SEAT = { ...SEAT, zIndex: 1 } as const;

interface KkStudioBStageDotProps {
  dot: KkStudioBDot;
  turned: boolean;
}

export const KkStudioBStageDot: FC<KkStudioBStageDotProps> = ({ dot, turned }) => {
  const lane = { transform: `translate(${dot.x * 100}%, ${dot.y * 100}%)` };
  const notch =
    dot.facing === null ? null : (
      <Box
        component="span"
        style={{ transform: `rotate(${dot.facing}deg)` }}
        sx={notchPaint(dot.role)}
      />
    );

  return (
    <Box style={lane} sx={LANE}>
      <Box sx={dot.role === 'own' ? OWN_SEAT : SEAT}>
        {notch}
        <KkStudioBStageDisc number={dot.number} role={dot.role} turned={turned} />
      </Box>
    </Box>
  );
};
