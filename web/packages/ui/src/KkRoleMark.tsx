import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkClubIcon } from './internal/club-icon';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { inkWashSurface } from './internal/ink-wash';
import { KkClubIconGlyph } from './KkClubIconGlyph';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkRoleMarkState = 'active' | 'archived';
export type KkRoleMarkSize = 'xsmall' | 'small' | 'medium' | 'large';

export interface KkRoleMarkCoin {
  icon: KkClubIcon;
  tone: KkGroupTone;
}

const EXTENTS: Record<KkRoleMarkSize, string> = {
  xsmall: '1.25rem',
  small: '1.75rem',
  medium: '2.25rem',
  large: '2.75rem',
};

const GLYPH_SHARE = '56%';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const hair = (color: string, style: 'solid' | 'dashed' = 'solid'): CSSObject => ({
  borderWidth: kkTokens.line.hair,
  borderStyle: style,
  borderColor: color,
});

const activePaint = (theme: Theme, tone: KkGroupTone | null): CSSObject =>
  tone === null
    ? {
        ...inkWashSurface(theme, '7%', '12%'),
        color: palette(theme).text.primary,
        ...hair('transparent'),
      }
    : { ...groupToneFieldPaint(theme, tone), ...hair('transparent') };

const archivedPaint = (theme: Theme): CSSObject => ({
  color: palette(theme).text.disabled,
  backgroundColor: 'transparent',
  ...hair(palette(theme).text.disabled, 'dashed'),
});

const markPaint = (theme: Theme, state: KkRoleMarkState, tone: KkGroupTone | null): CSSObject => {
  switch (state) {
    case 'active':
      return activePaint(theme, tone);
    case 'archived':
      return archivedPaint(theme);
  }
};

interface KkRoleMarkProps {
  coin: KkRoleMarkCoin | null;
  state: KkRoleMarkState;
  size?: KkRoleMarkSize;
  sx?: KkSx;
}

export const KkRoleMark: FC<KkRoleMarkProps> = ({ coin, state, size = 'medium', sx }) => {
  const glyph =
    coin === null ? (
      <KkIcon name="role" sx={{ width: GLYPH_SHARE, height: GLYPH_SHARE }} />
    ) : (
      <KkClubIconGlyph icon={coin.icon} sx={{ width: GLYPH_SHARE, height: GLYPH_SHARE }} />
    );

  return (
    <Box
      component="span"
      aria-hidden
      data-kk-role-mark={state}
      sx={[
        (theme) => ({
          display: 'inline-flex',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: EXTENTS[size],
          height: EXTENTS[size],
          borderRadius: '50%',
          transition: 'background-color 240ms ease-out, border-color 240ms ease-out',
          ...markPaint(theme, state, coin?.tone ?? null),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {glyph}
    </Box>
  );
};
