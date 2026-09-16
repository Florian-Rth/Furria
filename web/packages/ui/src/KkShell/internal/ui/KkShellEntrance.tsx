import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkScreenMove } from '../../screen-move';
import { screenEntranceOf } from '../logic/screen-entrance';

const TRACK_GAP = 3;

interface KkShellEntranceProps extends PropsWithChildren {
  path: string;
  move: KkScreenMove;
}

export const KkShellEntrance: FC<KkShellEntranceProps> = ({ path, move, children }) => {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const entrance = screenEntranceOf(move, reducedMotion);

  const trackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(TRACK_GAP),
  };

  return (
    <motion.div
      key={path}
      data-kk-shell-entrance
      style={trackStyle}
      initial={entrance.from}
      animate={entrance.to}
      transition={entrance.transition}
    >
      {children}
    </motion.div>
  );
};
