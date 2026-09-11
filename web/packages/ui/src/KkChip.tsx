import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkChipTone = 'neutral' | 'ink' | 'accent' | 'gold' | 'green' | 'blue';
type KkChipSize = 'small' | 'medium';

const DOT_SIZE = 6;
const GROUND_LIGHT = '12%';
const GROUND_DARK = '20%';

const toneColors: Record<KkChipTone, (theme: Theme) => string> = {
  neutral: (theme) => (theme.vars ?? theme).palette.text.secondary,
  ink: (theme) => (theme.vars ?? theme).palette.text.primary,
  accent: (theme) => (theme.vars ?? theme).palette.primary.main,
  gold: (theme) => (theme.vars ?? theme).palette.warning.main,
  green: (theme) => (theme.vars ?? theme).palette.success.main,
  blue: (theme) => (theme.vars ?? theme).palette.info.main,
};

const sizePadding: Record<KkChipSize, { px: number; py: number }> = {
  medium: { px: 1.125, py: 0.5 },
  small: { px: 1, py: 0.375 },
};

interface KkChipProps extends PropsWithChildren {
  tone?: KkChipTone;
  dot?: boolean;
  size?: KkChipSize;
  sx?: KkSx;
}

export const KkChip: FC<KkChipProps> = ({
  tone = 'neutral',
  dot = false,
  size = 'medium',
  sx,
  children,
}) => {
  const marker = dot ? (
    <Box
      aria-hidden
      sx={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        flexShrink: 0,
      }}
    />
  ) : null;

  return (
    <Stack
      component="span"
      direction="row"
      data-kk-chip
      sx={[
        (theme) => {
          const foreground = toneColors[tone](theme);

          return {
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: 0.75,
            color: foreground,
            backgroundColor: `color-mix(in srgb, ${foreground} ${GROUND_LIGHT}, transparent)`,
            ...theme.applyStyles('dark', {
              backgroundColor: `color-mix(in srgb, ${foreground} ${GROUND_DARK}, transparent)`,
            }),
            borderRadius: `${kkTokens.radius.pill}px`,
            fontFamily: kkTokens.font.body,
            fontSize: '0.6875rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            ...sizePadding[size],
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {marker}
      {children}
    </Stack>
  );
};
