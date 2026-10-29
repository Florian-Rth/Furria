import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioDGlyphName } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { KkStudioDGlyph } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { kkTokens } from '../../../tokens';
import { glassOf } from '../player-paint';

interface KkStudioDPlayerToolProps {
  label: string;
  glyph: KkStudioDGlyphName;
  active: boolean;
  spoken?: boolean;
  accent?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioDPlayerTool: FC<KkStudioDPlayerToolProps> = ({
  label,
  glyph,
  active,
  spoken = false,
  accent = false,
  disabled = false,
  onToggle,
}) => {
  const text = spoken ? (
    <Typography variant="body2" component="span" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  ) : null;

  return (
    <ButtonBase
      aria-label={spoken ? undefined : label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onToggle}
      data-kk-studio-d-tool={glyph}
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;
        return {
          height: kkTokens.tapTarget,
          minWidth: kkTokens.tapTarget,
          px: spoken ? 2 : 0,
          gap: 1,
          borderRadius: `${kkTokens.radius.pill}px`,
          ...glassOf(theme),
          ...(active &&
            accent && {
              backgroundColor: palette.primary.main,
              borderColor: palette.primary.main,
              color: kkTokens.color.light.onRed,
            }),
          ...(active &&
            !accent && {
              backgroundColor: palette.text.primary,
              borderColor: palette.text.primary,
              color: kkTokens.color.dark.darkroom,
            }),
          transition:
            'background-color .25s ease-out, border-color .25s ease-out, color .25s ease-out, transform .12s ease-out',
          '&:active': { transform: 'scale(.95)' },
          '&.Mui-disabled': { opacity: 0.4 },
          ...focusRing(theme),
        };
      }}
    >
      <KkStudioDGlyph name={glyph} size="1.25rem" />
      {text}
    </ButtonBase>
  );
};
