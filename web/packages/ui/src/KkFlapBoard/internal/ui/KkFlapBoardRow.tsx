import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { ElementType, FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { BOARD_INK } from '../../../internal/status-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkFlapCount } from '../../../KkFlapCount';
import { kkTokens } from '../../../tokens';
import { boardLinkOf } from '../board-link';
import { BOARD_STAGGER_SECONDS, boardCell, boardFocusRing, boardLabel } from '../board-paint';
import { KkFlapBoardMark } from './KkFlapBoardMark';

const HINGED = { opacity: 0, rotateX: -80 } as const;
const FADED = { opacity: 0 } as const;
const SHOWN = { opacity: 1, rotateX: 0 } as const;
const ROW_SECONDS = 0.32;

const rowFrame = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: '18px minmax(0, 1fr) auto minmax(4.5rem, auto)',
  alignItems: 'center',
  columnGap: 1.25,
  minHeight: kkTokens.system.boardRow,
  px: 1,
  color: 'inherit',
  textDecoration: 'none',
  ...boardCell,
  ...boardFocusRing,
  '@media (hover: hover)': {
    '&:hover': { backgroundColor: kkTokens.color.dark.darkroomEdge },
  },
  [theme.breakpoints.up('desktop')]: { columnGap: 2, px: 1.5 },
});

interface KkFlapBoardRowProps {
  level: KkStatusLevel;
  label: string;
  figure: string;
  word: string;
  to: string;
  component?: ElementType;
  order: number;
  accessibleLabel: string;
}

export const KkFlapBoardRow: FC<KkFlapBoardRowProps> = ({
  level,
  label,
  figure,
  word,
  to,
  component,
  order,
  accessibleLabel,
}) => {
  const reduced = useReducedMotion();
  const delay = order * BOARD_STAGGER_SECONDS;
  const initial = reduced ? FADED : HINGED;
  const transition = { duration: ROW_SECONDS, delay, ease: 'easeOut' } as const;
  const link = boardLinkOf(component, to);

  return (
    <Box
      component={motion.li}
      initial={initial}
      animate={SHOWN}
      transition={transition}
      data-kk-flap-board-row={level}
      sx={{ perspective: '400px', minWidth: 0 }}
    >
      <Box component={link.component} {...link.props} aria-label={accessibleLabel} sx={rowFrame}>
        <KkFlapBoardMark level={level} />
        <Typography component="span" sx={boardLabel}>
          {label}
        </Typography>
        <KkFlapCount
          value={figure}
          variant="h4"
          delaySeconds={delay}
          sx={{ color: BOARD_INK.ink }}
        />
        <KkFlapCount
          value={word}
          variant="overline"
          delaySeconds={delay + BOARD_STAGGER_SECONDS}
          sx={{ color: BOARD_INK[level], justifySelf: 'end', textTransform: 'uppercase' }}
        />
      </Box>
    </Box>
  );
};
