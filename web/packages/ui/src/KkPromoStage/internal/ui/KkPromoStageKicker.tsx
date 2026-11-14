import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_SETTLE, PROMO_SLAM } from '../promo-motion';

const SQUARE = 34;

interface KkPromoStageKickerProps {
  numeral: string;
  label: string;
  delay?: number;
}

export const KkPromoStageKicker: FC<KkPromoStageKickerProps> = ({
  numeral,
  label,
  delay = 0.15,
}) => {
  const { live } = usePromoScene();
  const at = (offset: number): number => (live ? delay + offset : 0);

  return (
    <Stack direction="row" data-kk-promo-kicker sx={{ alignItems: 'center', gap: 1.75 }}>
      <Stack
        component={motion.div}
        initial={{ scale: 0, rotate: -90 }}
        animate={live ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
        transition={{ ...PROMO_SLAM, delay: at(0) }}
        sx={{
          width: SQUARE,
          height: SQUARE,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
          {numeral}
        </Typography>
      </Stack>
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -14 }}
        animate={live ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
        transition={{ ...PROMO_SETTLE, delay: at(0.12) }}
      >
        <Typography variant="overline" sx={{ ...kkTokens.eyebrow, color: 'text.primary' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};
