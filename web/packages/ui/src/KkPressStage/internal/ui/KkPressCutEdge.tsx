import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { KK_PRESS_BEATS_MS } from '../../press-beats';

export type CutEdge = 'top' | 'right' | 'bottom' | 'left';

const SECONDS = 1000;
const CUT_OUTSET = -0.75;

const edgePlacementOf = (edge: CutEdge, outset: string): CSSObject => {
  const placements: Record<CutEdge, CSSObject> = {
    top: { top: outset, left: outset, right: outset, transformOrigin: 'left' },
    right: { right: outset, top: outset, bottom: outset, transformOrigin: 'top' },
    bottom: { bottom: outset, left: outset, right: outset, transformOrigin: 'right' },
    left: { left: outset, top: outset, bottom: outset, transformOrigin: 'bottom' },
  };
  return placements[edge];
};

const isAcross = (edge: CutEdge): boolean => edge === 'top' || edge === 'bottom';

const edgePaint =
  (edge: CutEdge) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    ...edgePlacementOf(edge, theme.spacing(CUT_OUTSET)),
    ...(isAcross(edge) ? { height: kkTokens.line.hair } : { width: kkTokens.line.hair }),
    backgroundColor: (theme.vars ?? theme).palette.primary.main,
  });

interface KkPressCutEdgeProps {
  edge: CutEdge;
}

export const KkPressCutEdge: FC<KkPressCutEdgeProps> = ({ edge }) => {
  const axis = isAcross(edge) ? 'scaleX' : 'scaleY';

  return (
    <Box
      component={motion.span}
      initial={{ [axis]: 0 }}
      animate={{ [axis]: 1 }}
      transition={{ duration: KK_PRESS_BEATS_MS.cut / SECONDS, ease: 'easeIn' }}
      sx={edgePaint(edge)}
    />
  );
};
