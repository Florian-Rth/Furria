import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_LINE_STAGGER, PROMO_RISE } from '../promo-motion';

const SHADOW_ROOM = 8;
const HIDDEN = { y: '112%', rotate: 4 };
const SHOWN = { y: '0%', rotate: 0 };

export type KkPromoHeadlineSize = 'poster' | 'display';

interface KkPromoStageHeadlineProps {
  line1: string;
  line2: string;
  size?: KkPromoHeadlineSize;
  delay?: number;
}

export const KkPromoStageHeadline: FC<KkPromoStageHeadlineProps> = ({
  line1,
  line2,
  size = 'poster',
  delay = 0.35,
}) => {
  const { live } = usePromoScene();
  const target = live ? SHOWN : HIDDEN;
  const lines = [
    { text: line1, accent: false },
    { text: line2, accent: true },
  ];

  return (
    <Typography variant={size} component="h2" data-kk-promo-headline sx={{ lineHeight: 0.98 }}>
      {lines.map((line, index) => (
        <Box
          key={line.accent ? 'accent' : 'ink'}
          component="span"
          sx={{
            display: 'block',
            overflow: 'clip',
            pb: `${SHADOW_ROOM}px`,
            mb: `-${SHADOW_ROOM}px`,
          }}
        >
          <Box
            component={motion.span}
            initial={HIDDEN}
            animate={target}
            transition={{ ...PROMO_RISE, delay: live ? delay + index * PROMO_LINE_STAGGER : 0 }}
            sx={(theme) => ({
              display: 'block',
              transformOrigin: 'left bottom',
              color: line.accent ? 'primary.main' : 'text.primary',
              textShadow: line.accent
                ? `${kkTokens.shadow.posterOffset} ${theme.palette.text.primary}`
                : 'none',
            })}
          >
            {line.text}
          </Box>
        </Box>
      ))}
    </Typography>
  );
};
