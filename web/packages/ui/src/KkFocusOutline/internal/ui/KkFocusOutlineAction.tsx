import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkFocusGlyphName } from '../../../KkFocusGlyph';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusOutlineActionProps {
  glyph: KkFocusGlyphName;
  text: string;
  disabled?: boolean;
  tone?: 'plain' | 'danger';
  onPress: () => void;
}

export const KkFocusOutlineAction: FC<KkFocusOutlineActionProps> = ({
  glyph,
  text,
  disabled = false,
  tone = 'plain',
  onPress,
}) => (
  <ButtonBase
    disabled={disabled}
    onClick={onPress}
    data-tone={tone}
    sx={(theme) => ({
      justifyContent: 'flex-start',
      gap: 1,
      minHeight: kkTokens.tapTarget,
      px: 1.5,
      color: palette(theme).text.secondary,
      '&:hover': {
        color: palette(theme).text.primary,
        backgroundColor: palette(theme).action.hover,
      },
      '&[data-tone="danger"]': { color: palette(theme).error.main },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      ...focusRing(theme),
    })}
  >
    <KkFocusGlyph name={glyph} />
    <Typography component="span" variant="caption" sx={{ fontWeight: 800, color: 'inherit' }}>
      {text}
    </Typography>
  </ButtonBase>
);
