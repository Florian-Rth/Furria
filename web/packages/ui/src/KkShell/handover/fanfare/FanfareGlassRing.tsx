import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { createPortal } from 'react-dom';
import { kkTokens } from '../../../tokens';

const { glint } = kkTokens.shell.material;
const { light, dark } = kkTokens.color;
const { hair } = kkTokens.line;
const BLOOM_REACH = '7rem 2.75rem';

const GLOW_STYLE: CSSProperties = { position: 'absolute', inset: 0, borderRadius: 'inherit' };

const bloomOf = (ringX: number, gold: string, core: number): string =>
  `radial-gradient(${BLOOM_REACH} at ${ringX}px 50%, ${alpha(gold, core)} 0%, ${alpha(gold, core * 0.4)} 45%, ${alpha(gold, 0)} 100%)`;

const rimOf = (edge: string, edgeOpacity: number, gold: string, haloOpacity: number): string =>
  `inset 0 0 0 ${hair}px ${alpha(edge, edgeOpacity)}, inset 0 ${hair}px 0 ${alpha(glint, edgeOpacity)}, inset 0 0 1.25rem ${alpha(gold, haloOpacity)}`;

const ringPaint = (): CSSObject => ({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  borderRadius: 'inherit',
  pointerEvents: 'none',
});

const glowPaint =
  (ringX: number) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundImage: bloomOf(ringX, light.gold, 0.3),
    boxShadow: rimOf(light.gold, 0.75, light.gold, 0.3),
    ...theme.applyStyles('dark', {
      backgroundImage: bloomOf(ringX, dark.gold, 0.26),
      boxShadow: rimOf(dark.gold, 0.6, dark.gold, 0.3),
    }),
  });

interface FanfareGlassRingProps {
  host: HTMLElement | null;
  ringX: number;
  glow: MotionValue<number>;
}

export const FanfareGlassRing: FC<FanfareGlassRingProps> = ({ host, ringX, glow }) => {
  if (host === null) {
    return null;
  }

  const glowStyle = { ...GLOW_STYLE, opacity: glow };

  return createPortal(
    <Box component="span" aria-hidden data-fanfare-ring sx={ringPaint}>
      <motion.span style={glowStyle}>
        <Box component="span" sx={glowPaint(ringX)} />
      </motion.span>
    </Box>,
    host,
  );
};
