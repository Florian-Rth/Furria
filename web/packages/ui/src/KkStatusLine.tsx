import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { redInk } from './internal/red-ink';
import { kkTokens } from './tokens';

export type KkStatusTone = 'quiet' | 'busy' | 'done' | 'attention' | 'conflict';

const DOT = '0.5rem';

const dotPaint =
  (tone: KkStatusTone) =>
  (theme: Theme): CSSObject => ({
    width: DOT,
    height: DOT,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor:
      tone === 'done'
        ? (theme.vars ?? theme).palette.success.main
        : tone === 'conflict'
          ? (theme.vars ?? theme).palette.primary.main
          : tone === 'attention'
            ? (theme.vars ?? theme).palette.warning.main
            : (theme.vars ?? theme).palette.text.disabled,
    animation: tone === 'busy' ? kkTokens.motion.breath : 'none',
  });

const textPaint =
  (tone: KkStatusTone) =>
  (theme: Theme): CSSObject => ({
    typography: 'caption',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    color: 'text.secondary',
    ...(tone === 'attention' ? goldInkOf(theme) : {}),
    ...(tone === 'conflict' ? redInk(theme) : {}),
    ...(tone === 'done' ? { color: 'text.primary' } : {}),
  });

interface KkStatusLineProps {
  tone: KkStatusTone;
  text: string;
}

export const KkStatusLine: FC<KkStatusLineProps> = ({ tone, text }) => (
  <Stack
    direction="row"
    role="status"
    data-kk-status-line={tone}
    sx={{ alignItems: 'center', gap: 0.625, flexShrink: 0 }}
  >
    <Box component="span" aria-hidden sx={dotPaint(tone)} />
    <Box component="span" sx={textPaint(tone)}>
      {text}
    </Box>
  </Stack>
);
