import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { RULE_CLOSED, RULE_DRAWN } from '../logic/bar-search-motion';

const { ruleDrop } = kkTokens.shell.barSearch;

const rulePaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: -ruleDrop,
  height: kkTokens.line.hair,
  borderRadius: `${kkTokens.radius.bar}px`,
  transformOrigin: 'right',
  pointerEvents: 'none',
  ...applyScheme(theme, schemeFill(kkTokens.color.light.red, kkTokens.color.dark.red)),
});

export const KkShellBarRule: FC = () => (
  <Box
    component={motion.span}
    aria-hidden
    data-kk-shell-bar-rule
    initial={RULE_CLOSED}
    animate={RULE_DRAWN}
    sx={rulePaint}
  />
);
