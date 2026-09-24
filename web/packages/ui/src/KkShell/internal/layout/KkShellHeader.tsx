import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkScreenHeaderKind } from '../../screen-declaration';
import { useHeaderMotion } from '../logic/use-header-motion';

const HEADER_GAP = 1.25;

interface KkShellHeaderProps extends PropsWithChildren {
  kind: KkScreenHeaderKind;
}

export const KkShellHeader: FC<KkShellHeaderProps> = ({ kind, children }) => {
  const motionValues = useHeaderMotion(kind);
  const fadeStyle = { minWidth: 0, opacity: motionValues.opacity, y: motionValues.drift };

  if (children === undefined || children === null) {
    return null;
  }

  return (
    <motion.div style={fadeStyle}>
      <Stack data-kk-shell-header sx={{ minWidth: 0, gap: HEADER_GAP, pointerEvents: 'none' }}>
        {children}
      </Stack>
    </motion.div>
  );
};
