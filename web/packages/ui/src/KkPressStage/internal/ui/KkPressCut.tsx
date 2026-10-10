import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkPressPhase } from '../../press-beats';
import type { CutEdge } from './KkPressCutEdge';
import { KkPressCutEdge } from './KkPressCutEdge';

const EDGES: readonly CutEdge[] = ['top', 'right', 'bottom', 'left'];

interface KkPressCutProps {
  phase: KkPressPhase;
  runKey: number;
}

export const KkPressCut: FC<KkPressCutProps> = ({ phase, runKey }) => {
  if (phase !== 'cut' && phase !== 'stamp') {
    return null;
  }

  const edges = EDGES.map((edge) => <KkPressCutEdge key={edge} edge={edge} />);

  return (
    <Box
      key={runKey}
      component={motion.div}
      aria-hidden
      data-kk-press-cut
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {edges}
    </Box>
  );
};
