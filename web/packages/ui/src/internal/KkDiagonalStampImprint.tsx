import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import { KkStampLayer } from './KkStampLayer';
import { useStampLife } from './use-stamp-life';

const STAMP_ANGLE = -12;
const STAMP_PAPER = '94%';
const STAMP_HOLD_MS = 2200;

const LIFTED = { scale: 1.4, opacity: 0, y: 0, rotate: STAMP_ANGLE - 6 };
const LANDED = {
  scale: 1,
  opacity: 1,
  y: 0,
  rotate: STAMP_ANGLE,
  transition: { type: 'spring', stiffness: 560, damping: 20 },
} as const;
const LEAVING = {
  scale: 0.94,
  opacity: 0,
  y: -24,
  rotate: STAMP_ANGLE,
  transition: { duration: 0.45, ease: 'easeIn' },
} as const;

const stampPaint = (theme: Theme) => {
  const palette = (theme.vars ?? theme).palette;
  return {
    maxWidth: '100%',
    color: palette.text.secondary,
    border: `${kkTokens.line.page}px solid ${palette.text.secondary}`,
    outline: `${kkTokens.line.hair}px solid ${palette.text.secondary}`,
    outlineOffset: theme.spacing(-0.75),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    backgroundColor: `color-mix(in srgb, ${palette.background.paper} ${STAMP_PAPER}, transparent)`,
    boxShadow: kkTokens.shadow.floating,
    px: 3,
    py: 1.25,
  } as const;
};

interface KkDiagonalStampImprintProps {
  label: string;
}

export const KkDiagonalStampImprint: FC<KkDiagonalStampImprintProps> = ({ label }) => {
  const { life, leave } = useStampLife(STAMP_HOLD_MS);

  if (life === 'gone') {
    return null;
  }

  const target = life === 'leaving' ? LEAVING : LANDED;

  return (
    <KkStampLayer>
      <Box
        component={motion.div}
        data-kk-diagonal-stamp
        initial={LIFTED}
        animate={target}
        onAnimationComplete={leave}
        sx={stampPaint}
      >
        <Typography
          variant="h2"
          component="span"
          sx={{ textTransform: 'uppercase', lineHeight: 1 }}
        >
          {label}
        </Typography>
      </Box>
    </KkStampLayer>
  );
};
