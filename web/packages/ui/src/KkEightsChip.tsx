import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkEightsGlyphName } from './KkEightsGlyph';
import { KkEightsGlyph } from './KkEightsGlyph';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsChipProps {
  glyph: KkEightsGlyphName;
  text: string;
  pressed: boolean | null;
  disabled?: boolean;
  label?: string;
  textHidden?: boolean;
  onPress: () => void;
}

export const KkEightsChip: FC<KkEightsChipProps> = ({
  glyph,
  text,
  pressed,
  disabled = false,
  label,
  textHidden = false,
  onPress,
}) => (
  <ButtonBase
    aria-pressed={pressed ?? undefined}
    aria-label={label ?? (textHidden ? text : undefined)}
    title={textHidden ? text : undefined}
    disabled={disabled}
    onClick={onPress}
    data-kk-eights-chip
    data-pressed={pressed === true}
    sx={(theme) => ({
      flexShrink: 0,
      minHeight: kkTokens.tapTarget,
      gap: 0.75,
      px: 1.25,
      minWidth: kkTokens.tapTarget,
      borderRadius: `${kkTokens.radius.chip}px`,
      color: palette(theme).text.primary,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      transition: 'background-color 120ms ease-out, color 120ms ease-out',
      '& svg': { color: palette(theme).text.secondary },
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 11%, transparent)`,
      },
      '&[data-pressed="true"]': {
        backgroundColor: palette(theme).text.primary,
        color: palette(theme).background.paper,
        boxShadow: 'none',
        '& svg': { color: 'inherit' },
      },
      '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
      ...focusRing(theme),
    })}
  >
    <KkEightsGlyph name={glyph} />
    <Typography
      component="span"
      variant="body2"
      hidden={textHidden}
      sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
