import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { createPortal } from 'react-dom';
import { kkTokens } from '../../../../tokens';

const { material } = kkTokens.shell;
const { light, dark } = kkTokens.color;
const BAND_SKEW = -20;

const BAND_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  width: '22%',
};

const sheenOf = (core: number, edge: string, edgeOpacity: number): string =>
  `linear-gradient(90deg, transparent 0%, ${alpha(edge, edgeOpacity)} 34%, ${alpha(material.glint, core)} 48%, ${alpha(material.glint, core)} 52%, ${alpha(edge, edgeOpacity)} 66%, transparent 100%)`;

const glintPaint = (): CSSObject => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  clipPath: `inset(0 round ${kkTokens.radius.base}px)`,
  pointerEvents: 'none',
});

const bandPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: sheenOf(0.92, light.ink, 0.05),
  ...theme.applyStyles('dark', {
    mixBlendMode: 'screen',
    backgroundImage: sheenOf(0.3, dark.gold, 0.06),
  }),
});

interface FallblattGlintProps {
  host: HTMLElement | null;
  sweepX: MotionValue<string>;
  sweepOpacity: MotionValue<number>;
}

export const FallblattGlint: FC<FallblattGlintProps> = ({ host, sweepX, sweepOpacity }) => {
  if (host === null) {
    return null;
  }

  return createPortal(
    <Box component="span" aria-hidden sx={glintPaint}>
      <motion.span style={{ ...BAND_STYLE, x: sweepX, skewX: BAND_SKEW, opacity: sweepOpacity }}>
        <Box component="span" sx={bandPaint} />
      </motion.span>
    </Box>,
    host,
  );
};
