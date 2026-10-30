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

interface KkFocusTopButtonProps {
  glyph: KkFocusGlyphName;
  text: string;
  label?: string;
  pressed?: boolean;
  disabled?: boolean;
  quietText?: boolean;
  onPress: () => void;
}

export const KkFocusTopButton: FC<KkFocusTopButtonProps> = ({
  glyph,
  text,
  label,
  pressed,
  disabled = false,
  quietText = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={label ?? text}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    data-pressed={pressed === true}
    sx={(theme) => ({
      flex: 'none',
      gap: 0.5,
      minHeight: kkTokens.tapTarget,
      minWidth: kkTokens.tapTarget,
      px: 1,
      borderRadius: `${kkTokens.radius.base - 4}px`,
      color: palette(theme).text.primary,
      transition: 'background-color 140ms ease-out',
      '&:hover': { backgroundColor: palette(theme).action.hover },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      '&[data-pressed="true"]': tonePaint(theme, 'ink'),
      ...focusRing(theme),
    })}
  >
    <KkFocusGlyph name={glyph} />
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        whiteSpace: 'nowrap',
        color: 'inherit',
        display: quietText ? { xs: 'none', lg: 'inline' } : 'inline',
      }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
