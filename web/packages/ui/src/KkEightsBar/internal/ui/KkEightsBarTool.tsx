import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkEightsGlyphName } from '../../../KkEightsGlyph';
import { KkEightsGlyph } from '../../../KkEightsGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsBarToolProps {
  glyph: KkEightsGlyphName;
  text: string;
  label?: string;
  shortcut?: string;
  textHidden?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkEightsBarTool: FC<KkEightsBarToolProps> = ({
  glyph,
  text,
  label,
  shortcut,
  textHidden = false,
  disabled = false,
  onPress,
}) => {
  const caption = textHidden ? null : (
    <Typography component="span" variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
      {text}
    </Typography>
  );

  return (
    <ButtonBase
      aria-label={label ?? text}
      aria-keyshortcuts={shortcut}
      title={label ?? text}
      disabled={disabled}
      onClick={onPress}
      sx={(theme) => ({
        flexShrink: 0,
        gap: 0.5,
        minWidth: kkTokens.tapTarget,
        minHeight: kkTokens.tapTarget,
        px: textHidden ? 0 : 1,
        borderRadius: `${kkTokens.radius.base}px`,
        color: palette(theme).text.primary,
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 8%, transparent)`,
        },
        '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
        ...focusRing(theme),
      })}
    >
      <KkEightsGlyph name={glyph} />
      {caption}
    </ButtonBase>
  );
};
