import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

const { nav } = kkTokens.shell;
const BAR_LAYOUT_ID = 'kk-shell-nav-bar';

const barPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  bottom: nav.barInset,
  left: 0,
  right: 0,
  marginInline: 'auto',
  width: nav.barWidth,
  height: nav.barThickness,
  borderRadius: `${kkTokens.radius.bar}px`,
  pointerEvents: 'none',
  ...applyScheme(theme, schemeFill(kkTokens.color.light.red, kkTokens.color.dark.red)),
});

interface KkShellNavBarProps {
  transition: Transition;
}

export const KkShellNavBar: FC<KkShellNavBarProps> = ({ transition }) => (
  <Box
    component={motion.span}
    layoutId={BAR_LAYOUT_ID}
    transition={transition}
    aria-hidden
    sx={barPaint}
  />
);
