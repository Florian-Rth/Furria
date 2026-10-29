import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { inkWashSurface } from './internal/ink-wash';
import { redInk } from './internal/red-ink';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSeverity } from './KkSeverityGlyph';
import { KkSeverityGlyph } from './KkSeverityGlyph';
import { KkVisuallyHidden } from './KkVisuallyHidden';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const ICON_SIZE = '0.875rem';

const chipPaint = (theme: Theme, state: KkSeverity): CSSObject => ({
  ...inkWashSurface(theme, '5%', '9%'),
  color: 'text.primary',
  ...(state === 'conflict'
    ? {
        ...redInk(theme),
        borderColor: (theme.vars ?? theme).palette.primary.main,
        borderStyle: 'solid',
      }
    : {}),
  ...(state === 'hint'
    ? {
        ...goldInkOf(theme),
        borderColor: (theme.vars ?? theme).palette.warning.main,
        borderStyle: 'dashed',
      }
    : {}),
  ...(state === 'off'
    ? { color: 'text.disabled', textDecoration: 'line-through', backgroundColor: 'transparent' }
    : {}),
});

interface KkWishChipProps {
  icon: KkIconName;
  label: string;
  state: KkSeverity;
  stateLabel: string;
  marked?: boolean;
  sx?: KkSx;
}

export const KkWishChip: FC<KkWishChipProps> = ({
  icon,
  label,
  state,
  stateLabel,
  marked = true,
  sx,
}) => (
  <Stack
    component="span"
    direction="row"
    data-kk-wish-chip={state}
    title={stateLabel}
    sx={[
      (theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        maxWidth: '100%',
        px: 0.75,
        py: 0.25,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: `${kkTokens.radius.base}px`,
        typography: 'caption',
        fontWeight: 700,
        lineHeight: 1.25,
        ...chipPaint(theme, state),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkIcon name={icon} sx={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} />
    <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      {label}
    </Box>
    {marked ? <KkSeverityGlyph state={state} /> : null}
    <KkVisuallyHidden>{stateLabel}</KkVisuallyHidden>
  </Stack>
);
