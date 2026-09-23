import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkHandoverHeaderProps } from '../../handover-stage';
import { KkShellHeader } from '../../internal/layout/KkShellHeader';
import { useDockHeaderFade } from './use-dock-header-fade';

const HEADER_GAP = 1.25;
const HEADLINE_VISIBILITY = '--kk-dock-headline';

export const ConfettiHeader: FC<KkHandoverHeaderProps> = ({ kind, children }) => {
  const reducedMotion = useReducedMotion();
  const fade = useDockHeaderFade();

  const headerStyle = {
    opacity: fade.opacity,
    y: fade.drift,
    [HEADLINE_VISIBILITY]: fade.headlineOpacity,
  };

  if (kind === 'banner' || reducedMotion) {
    return <KkShellHeader kind={kind}>{children}</KkShellHeader>;
  }

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <motion.div data-kk-dock-header style={headerStyle}>
      <Stack
        sx={{
          minWidth: 0,
          gap: HEADER_GAP,
          pointerEvents: 'none',
          '& [data-kk-screen-header-title]': { opacity: `var(${HEADLINE_VISIBILITY})` },
        }}
      >
        {children}
      </Stack>
    </motion.div>
  );
};
