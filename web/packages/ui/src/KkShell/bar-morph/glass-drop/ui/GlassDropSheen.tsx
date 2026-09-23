import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../../tokens';
import type { GlassSheenPath } from '../logic/glass-drop-paths';
import { glassSheenPaint } from '../logic/glass-skin';

const SHEEN_STYLE = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;

interface GlassDropSheenProps {
  path: GlassSheenPath;
}

export const GlassDropSheen: FC<GlassDropSheenProps> = ({ path }) => {
  const initial = { backgroundPositionX: path.from, opacity: 0 };
  const animate = { backgroundPositionX: path.to, opacity: [0, 1, 1, 0] };
  const transition = { duration: path.duration, delay: path.delay, ease: 'easeInOut' } as const;

  return (
    <Box
      component={motion.div}
      aria-hidden
      style={SHEEN_STYLE}
      initial={initial}
      animate={animate}
      transition={transition}
      sx={[
        {
          borderRadius: `${kkTokens.radius.base}px`,
          backgroundSize: '260% 100%',
          backgroundRepeat: 'no-repeat',
        },
        glassSheenPaint,
      ]}
    />
  );
};
