import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkConfettiRain } from '../../../KkConfettiRain';
import { KkSeal } from '../../../KkSeal';
import { kkTokens } from '../../../tokens';
import { PROMO_RISE, PROMO_SLAM } from '../promo-motion';
import { PROMO_GUTTER } from '../promo-paint';

const { dark, light } = kkTokens.color;
const DIM = 'rgba(12,13,16,0.94)';
const VEIL = 'blur(10px) saturate(0.5)';
const FLASH = 'rgba(255,246,216,0.9)';
const SEAL_SIZE = 300;
const SEAL_CENTER = { x: 980, y: 330 };
const STAMP_AT = 0.95;
const NAME_STAGGER = 0.42;
const MAX_NAMES = 4;
const RAIN_COUNT = 34;
const RAIN_SEED = 23;

export interface KkPromoArrivalLabels {
  kicker: string;
  welcome: string;
  sealLabel: string;
  sealCaption: string;
}

interface PromoArrivalProps {
  names: readonly string[];
  more: string | null;
  labels: KkPromoArrivalLabels;
}

export const PromoArrival: FC<PromoArrivalProps> = ({ names, more, labels }) => {
  const { kicker, welcome, sealLabel, sealCaption } = labels;
  const shownNames = names.slice(0, MAX_NAMES);
  const nameVariant = shownNames.length > 1 ? 'display' : 'poster';

  return (
    <Box
      component={motion.div}
      data-kk-promo-arrival
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      transition={{ duration: 0.3 }}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 6,
        bgcolor: DIM,
        backdropFilter: VEIL,
        color: dark.ink,
      }}
    >
      <Box
        component={motion.div}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.22, 0] }}
        transition={{ duration: 0.5, times: [0, 0.15, 1], delay: STAMP_AT }}
        sx={{ position: 'absolute', inset: 0, bgcolor: FLASH, mixBlendMode: 'screen' }}
      />
      <KkConfettiRain count={RAIN_COUNT} seed={RAIN_SEED} alwaysPlays />
      <Stack sx={{ position: 'absolute', left: PROMO_GUTTER, top: 150, width: 720, gap: 2 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...PROMO_RISE, delay: 0.2 }}
        >
          <Typography variant="h3" component="p" sx={{ ...kkTokens.eyebrow, color: light.gold }}>
            {kicker}
          </Typography>
        </Box>
        <Box sx={{ overflow: 'clip' }}>
          <Box
            component={motion.div}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ ...PROMO_RISE, delay: 0.35 }}
          >
            <Typography variant="h1" component="p" sx={{ color: dark.sub }}>
              {welcome}
            </Typography>
          </Box>
        </Box>
        {shownNames.map((name, index) => (
          <Box
            key={name}
            component={motion.div}
            initial={{ scale: 2.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -2 }}
            transition={{ ...PROMO_SLAM, delay: 0.7 + index * NAME_STAGGER }}
            sx={{ transformOrigin: 'left center' }}
          >
            <Typography
              variant={nameVariant}
              component="p"
              sx={{ color: dark.ink, lineHeight: 0.95 }}
            >
              {name}
            </Typography>
          </Box>
        ))}
        {more !== null && (
          <Typography variant="h2" component="p" sx={{ color: dark.sub }}>
            {more}
          </Typography>
        )}
      </Stack>
      <Box
        component={motion.div}
        initial={{ scale: 3.2, rotate: -40, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ ...PROMO_SLAM, delay: STAMP_AT - 0.18 }}
        sx={{
          position: 'absolute',
          left: SEAL_CENTER.x - SEAL_SIZE / 2,
          top: SEAL_CENTER.y - SEAL_SIZE / 2,
        }}
      >
        <KkSeal dateLabel={sealLabel} caption={sealCaption} size={SEAL_SIZE} rotation={-8} />
      </Box>
    </Box>
  );
};
