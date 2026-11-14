import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkQrCode } from '../../../KkQrCode';
import { kkTokens } from '../../../tokens';
import { PROMO_GLIDE } from '../promo-motion';
import { PROMO_CANVAS, PROMO_FOOT_HEIGHT, PROMO_GUTTER, PROMO_SHADOW } from '../promo-paint';

export type KkPromoQrPose = 'away' | 'corner' | 'hero';

export interface KkPromoQrAnchor {
  right: number;
  bottom: number;
}

const CARD_WIDTH = 330;
const CODE_WIDTH = 268;
const CORNER_WIDTH = 196;
const CORNER_LIFT = 26;
const CORNER_TILT = 2;
const HERO_TILT = -3;
const AWAY_DROP = 260;
const AWAY_SHRINK = 0.8;
const AWAY_SPIN = 8;
const HERO_DELAY = 0.3;
const CORNER_ANCHOR: KkPromoQrAnchor = {
  right: PROMO_CANVAS.width - PROMO_GUTTER,
  bottom: PROMO_CANVAS.height - PROMO_FOOT_HEIGHT - CORNER_LIFT,
};

interface KkPromoStageQrCardProps {
  value: string;
  call: string;
  address: string;
  pose: KkPromoQrPose;
  hero: KkPromoQrAnchor;
}

type QrPoseTarget = Record<'x' | 'y' | 'scale' | 'rotate' | 'opacity', number>;

const posesOf = (hero: KkPromoQrAnchor): Record<KkPromoQrPose, QrPoseTarget> => {
  const heroX = hero.right - CORNER_ANCHOR.right;
  const heroY = hero.bottom - CORNER_ANCHOR.bottom;

  return {
    corner: { x: 0, y: 0, scale: CORNER_WIDTH / CARD_WIDTH, rotate: CORNER_TILT, opacity: 1 },
    hero: { x: heroX, y: heroY, scale: 1, rotate: HERO_TILT, opacity: 1 },
    away: {
      x: heroX,
      y: heroY + AWAY_DROP,
      scale: AWAY_SHRINK,
      rotate: HERO_TILT + AWAY_SPIN,
      opacity: 0,
    },
  };
};

export const KkPromoStageQrCard: FC<KkPromoStageQrCardProps> = ({
  value,
  call,
  address,
  pose,
  hero,
}) => {
  const poses = posesOf(hero);
  const transition = { ...PROMO_GLIDE, delay: pose === 'hero' ? HERO_DELAY : 0 };

  return (
    <Stack
      component={motion.div}
      data-kk-promo-qr-card={pose}
      initial={poses.away}
      animate={poses[pose]}
      transition={transition}
      sx={{
        position: 'absolute',
        right: PROMO_GUTTER,
        bottom: PROMO_FOOT_HEIGHT + CORNER_LIFT,
        zIndex: 5,
        width: CARD_WIDTH,
        p: 2,
        gap: 1.5,
        transformOrigin: 'right bottom',
        willChange: 'transform',
        bgcolor: 'background.paper',
        borderRadius: `${kkTokens.radius.base}px`,
        border: kkTokens.line.hair,
        borderColor: 'divider',
        boxShadow: PROMO_SHADOW.card,
      }}
    >
      <Typography variant="h1" component="p" sx={{ lineHeight: 1 }}>
        {call}
      </Typography>
      <Box sx={{ width: CODE_WIDTH, alignSelf: 'center' }}>
        <KkQrCode value={value} label={call} />
      </Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, textAlign: 'center', color: 'text.secondary' }}
      >
        {address}
      </Typography>
    </Stack>
  );
};
