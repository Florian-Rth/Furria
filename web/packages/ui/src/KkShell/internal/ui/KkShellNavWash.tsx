import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { applyScheme, schemeEdge, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

const { nav } = kkTokens.shell;
const WASH_LAYOUT_ID = 'kk-shell-nav-wash';

const washPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: nav.washInsetY,
  bottom: nav.washInsetY,
  left: nav.washInsetX,
  right: nav.washInsetX,
  marginInline: 'auto',
  maxWidth: nav.washMaxWidth,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  pointerEvents: 'none',
  ...applyScheme(
    theme,
    schemeFill(
      alpha(kkTokens.color.light.ink, nav.washTint.light),
      alpha(kkTokens.color.dark.ink, nav.washTint.dark),
    ),
    schemeEdge(
      alpha(kkTokens.color.light.ink, nav.washEdge.light),
      alpha(kkTokens.color.dark.ink, nav.washEdge.dark),
    ),
  ),
});

interface KkShellNavWashProps {
  transition: Transition;
}

export const KkShellNavWash: FC<KkShellNavWashProps> = ({ transition }) => (
  <Box
    component={motion.span}
    layoutId={WASH_LAYOUT_ID}
    transition={transition}
    aria-hidden
    sx={washPaint}
  />
);
