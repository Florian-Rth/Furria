import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { tonePaint } from '../../../internal/tone';
import type { KkFocusGlyphName } from '../../../KkFocusGlyph';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusBarChipProps {
  glyph: KkFocusGlyphName;
  text: string;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkFocusBarChip: FC<KkFocusBarChipProps> = ({
  glyph,
  text,
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    data-pressed={pressed === true}
    sx={(theme) => ({
      flex: 'none',
      gap: 0.5,
      minHeight: kkTokens.tapTarget,
      px: 1.25,
      borderRadius: `${kkTokens.radius.chip}px`,
      color: palette(theme).text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      transition: 'background-color 140ms ease-out',
      '&:hover': { backgroundColor: palette(theme).action.hover },
      '&.Mui-disabled': { color: palette(theme).text.disabled, boxShadow: 'none' },
      '&[data-pressed="true"]': { ...tonePaint(theme, 'ink'), boxShadow: 'none' },
      ...focusRing(theme),
    })}
  >
    <KkFocusGlyph name={glyph} />
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 800, whiteSpace: 'nowrap', color: 'inherit' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
