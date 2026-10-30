import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkStudioToolbarGlyph = 'multi' | 'mirror' | 'onion' | 'arrange';

const GLYPHS: Record<KkStudioToolbarGlyph, ReactNode> = {
  multi: <SelectAllRoundedIcon fontSize="small" />,
  mirror: <FlipRoundedIcon fontSize="small" />,
  onion: <LayersRoundedIcon fontSize="small" />,
  arrange: <GridViewRoundedIcon fontSize="small" />,
};

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const togglePaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    height: '2.25rem',
    gap: 0.5,
    px: 1,
    minWidth: '2.25rem',
    borderRadius: `${kkTokens.radius.pill}px`,
    color: pressed ? palette(theme).background.paper : palette(theme).text.primary,
    backgroundColor: pressed
      ? palette(theme).text.primary
      : `color-mix(in srgb, ${palette(theme).background.paper} 88%, transparent)`,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    transition: 'background-color 180ms ease-out, color 180ms ease-out, transform 120ms ease-out',
    '&:active': { transform: 'scale(0.94)' },
    '&.Mui-disabled': { color: palette(theme).text.disabled },
    ...focusRing(theme),
  });

interface KkStudioToolbarToggleProps {
  glyph: KkStudioToolbarGlyph;
  text: string;
  pressed: boolean | null;
  disabled?: boolean;
  onPress: () => void;
}

export const KkStudioToolbarToggle: FC<KkStudioToolbarToggleProps> = ({
  glyph,
  text,
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={text}
    aria-pressed={pressed ?? undefined}
    disabled={disabled}
    onClick={onPress}
    data-kk-studio-toggle={glyph}
    sx={togglePaint(pressed === true)}
  >
    {GLYPHS[glyph]}
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: 'inherit',
        '@container (max-width: 30rem)': { display: 'none' },
      }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
