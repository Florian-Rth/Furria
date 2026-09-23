import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import type { KkHandoverHeaderProps } from '../../../handover-stage';
import { KkShellHeader } from '../../../internal/layout/KkShellHeader';
import { useSchunkelnHeaderFade } from '../logic/use-schunkeln-header-fade';

const HEADER_GAP = 1.25;
const HANDED_TO_FLIGHT =
  'body:has([data-kk-schunkeln-flight][data-flying="true"]) & [data-kk-screen-header-title]';

const FADE_STYLE: CSSProperties = { minWidth: 0, pointerEvents: 'none' };

const HEADER_SX = {
  minWidth: 0,
  gap: HEADER_GAP,
  pointerEvents: 'none',
  [HANDED_TO_FLIGHT]: { opacity: 0 },
} as const;

export const SchunkelnHeader: FC<KkHandoverHeaderProps> = ({ kind, children }) => {
  const reducedMotion = useReducedMotion();
  const fade = useSchunkelnHeaderFade();

  const fadeStyle = { ...FADE_STYLE, opacity: fade.opacity, y: fade.drift };

  if (kind === 'banner' || reducedMotion) {
    return <KkShellHeader kind={kind}>{children}</KkShellHeader>;
  }

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <motion.div data-kk-schunkeln-header style={fadeStyle}>
      <Stack data-kk-shell-header sx={HEADER_SX}>
        {children}
      </Stack>
    </motion.div>
  );
};
