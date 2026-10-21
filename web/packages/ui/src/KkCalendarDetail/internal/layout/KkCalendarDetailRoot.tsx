import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';

const RISEN = { opacity: 0, y: 10 } as const;
const FADED = { opacity: 0 } as const;
const SETTLED = { opacity: 1, y: 0 } as const;
const SETTLE = { duration: 0.24, ease: 'easeOut' } as const;

interface KkCalendarDetailRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkCalendarDetailRoot: FC<KkCalendarDetailRootProps> = ({ label, sx, children }) => {
  const reduced = useReducedMotion();

  return (
    <Box
      component={motion.article}
      initial={reduced ? FADED : RISEN}
      animate={SETTLED}
      transition={SETTLE}
      aria-label={label}
      data-kk-calendar-detail
      sx={[
        {
          display: 'grid',
          gridTemplateRows: 'minmax(0, 1fr) auto',
          minHeight: 0,
          minWidth: 0,
          flex: '1 1 auto',
          borderRadius: 'inherit',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};
