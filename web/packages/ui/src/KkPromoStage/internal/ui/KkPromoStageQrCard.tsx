import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkQrCode } from '../../../KkQrCode';
import { kkTokens } from '../../../tokens';
import { PROMO_SLAM } from '../promo-motion';
import { PROMO_SHADOW } from '../promo-paint';

export type KkPromoQrSize = 'corner' | 'hero';

const SIZES: Record<KkPromoQrSize, { card: number; code: number; tilt: number }> = {
  corner: { card: 196, code: 148, tilt: 2 },
  hero: { card: 330, code: 268, tilt: -3 },
};

interface KkPromoStageQrCardProps {
  value: string;
  call: string;
  address: string;
  size?: KkPromoQrSize;
  shown?: boolean;
  delay?: number;
  dock?: KkPromoDock | null;
}

export interface KkPromoDock {
  x: number;
  y: number;
  scale: number;
}

export const KkPromoStageQrCard: FC<KkPromoStageQrCardProps> = ({
  value,
  call,
  address,
  size = 'corner',
  shown = true,
  delay = 0,
  dock = null,
}) => {
  const look = SIZES[size];
  const away = { x: 0, y: 260, rotate: look.tilt + 16, scale: 0.6, opacity: 0 };
  const home = { x: 0, y: 0, rotate: look.tilt, scale: 1, opacity: 1 };
  const docked =
    dock === null
      ? home
      : { x: dock.x, y: dock.y, rotate: SIZES.corner.tilt, scale: dock.scale, opacity: 1 };

  return (
    <Stack
      component={motion.div}
      data-kk-promo-qr-card={size}
      initial={away}
      animate={shown ? docked : away}
      transition={{ ...PROMO_SLAM, delay: shown ? delay : 0 }}
      sx={{
        width: look.card,
        p: 2,
        gap: 1.5,
        bgcolor: 'background.paper',
        borderRadius: `${kkTokens.radius.base}px`,
        border: kkTokens.line.hair,
        borderColor: 'divider',
        boxShadow: PROMO_SHADOW.card,
      }}
    >
      <Typography variant={size === 'hero' ? 'h1' : 'h3'} component="p" sx={{ lineHeight: 1 }}>
        {call}
      </Typography>
      <Box sx={{ width: look.code, alignSelf: 'center' }}>
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
