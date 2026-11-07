import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkFocusRing } from '../../../internal/ink-focus-ring';
import { redInk } from '../../../internal/red-ink';
import type { KkLaneGlyphName } from '../../../KkLaneGlyph';
import { KkLaneGlyph } from '../../../KkLaneGlyph';
import type { KkPillButtonTone } from '../../../KkPillButton';
import { kkTokens } from '../../../tokens';

const DISABLED_OPACITY = 0.38;
const TOOL_HEIGHT = '3.5rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const tonePaints: Record<KkPillButtonTone, (theme: Theme) => CSSObject> = {
  quiet: (theme) => ({
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
  }),
  ink: (theme) => ({
    color: palette(theme).background.paper,
    backgroundColor: palette(theme).text.primary,
  }),
  accent: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
  }),
  danger: (theme) => ({
    ...redInk(theme),
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).error.main} 45%, transparent)`,
  }),
};

interface KkEditorToolBarToolProps {
  text: string;
  glyph: KkLaneGlyphName;
  label?: string;
  tone?: KkPillButtonTone;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkEditorToolBarTool: FC<KkEditorToolBarToolProps> = ({
  text,
  glyph,
  label,
  tone = 'quiet',
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    data-kk-editor-tool={tone}
    sx={(theme) => ({
      minHeight: TOOL_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 0.25,
      px: 0.25,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      transition: 'background-color 160ms ease-out, color 160ms ease-out, transform 120ms ease-out',
      '&:active': { transform: 'scale(0.96)' },
      ...tonePaints[tone](theme),
      ...(pressed === true
        ? {
            color: palette(theme).background.paper,
            backgroundColor: palette(theme).text.primary,
            boxShadow: 'none',
          }
        : {}),
      '&.Mui-disabled': { opacity: DISABLED_OPACITY },
      ...inkFocusRing(theme),
    })}
  >
    <KkLaneGlyph name={glyph} />
    <Typography
      component="span"
      variant="caption"
      sx={{
        maxWidth: '100%',
        fontWeight: 800,
        lineHeight: 1.1,
        textAlign: 'center',
        color: 'inherit',
        overflowWrap: 'break-word',
        hyphens: 'auto',
      }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
