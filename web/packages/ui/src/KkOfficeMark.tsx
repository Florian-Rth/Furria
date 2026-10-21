import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkClubIcon } from './internal/club-icon';
import { goldInkOf } from './internal/gold-ink';
import { inkWashSurface } from './internal/ink-wash';
import { tonePaint } from './internal/tone';
import { KkClubIconGlyph } from './KkClubIconGlyph';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkOfficeMarkState = 'held' | 'vacant' | 'attention' | 'planned' | 'archived';
export type KkOfficeMarkSize = 'small' | 'medium' | 'large';

const EXTENTS: Record<KkOfficeMarkSize, string> = {
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

const markPaint = (theme: Theme, state: KkOfficeMarkState): CSSObject => {
  switch (state) {
    case 'held':
      return {
        ...inkWashSurface(theme, '7%', '12%'),
        color: palette(theme).text.primary,
        ...hair('transparent'),
      };
    case 'vacant':
      return {
        ...goldInkOf(theme),
        backgroundColor: 'transparent',
        ...hair(palette(theme).warning.main, 'dashed'),
        borderWidth: kkTokens.line.section,
      };
    case 'attention':
      return { ...tonePaint(theme, 'gold'), ...hair(palette(theme).warning.main) };
    case 'planned':
      return {
        color: palette(theme).text.primary,
        backgroundColor: palette(theme).background.paper,
        ...hair(palette(theme).text.secondary),
      };
    case 'archived':
      return {
        color: palette(theme).text.disabled,
        backgroundColor: 'transparent',
        ...hair(palette(theme).text.disabled, 'dashed'),
      };
  }
};

interface KkOfficeMarkProps {
  icon: KkClubIcon | null;
  state: KkOfficeMarkState;
  size?: KkOfficeMarkSize;
  sx?: KkSx;
}

export const KkOfficeMark: FC<KkOfficeMarkProps> = ({ icon, state, size = 'medium', sx }) => {
  const glyph =
    icon === null ? (
      <KkIcon name="board" sx={{ width: GLYPH_SHARE, height: GLYPH_SHARE }} />
    ) : (
      <KkClubIconGlyph icon={icon} sx={{ width: GLYPH_SHARE, height: GLYPH_SHARE }} />
    );

  return (
    <Box
      component="span"
      aria-hidden
      data-kk-office-mark={state}
      sx={[
        (theme) => ({
          display: 'inline-flex',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          width: EXTENTS[size],
          height: EXTENTS[size],
          borderRadius: '50%',
          transition: 'background-color 240ms ease-out, border-color 240ms ease-out',
          ...markPaint(theme, state),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {glyph}
    </Box>
  );
};
