import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkEightsGlyphName } from '../../../KkEightsGlyph';
import { KkEightsGlyph } from '../../../KkEightsGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsSetupNextProps {
  eyebrow: string;
  title: string;
  text: string;
  glyph: KkEightsGlyphName;
  action: string;
  disabled?: boolean;
  onAction: () => void;
}

export const KkEightsSetupNext: FC<KkEightsSetupNextProps> = ({
  eyebrow,
  title,
  text,
  glyph,
  action,
  disabled = false,
  onAction,
}) => (
  <Stack
    component="section"
    aria-label={title}
    sx={(theme) => ({
      gap: 1.25,
      p: 2,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}, inset ${kkTokens.line.page}px 0 0 ${palette(theme).primary.main}`,
    })}
  >
    <Typography
      variant="overline"
      sx={(theme) => ({
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.2,
        color: palette(theme).text.secondary,
      })}
    >
      {eyebrow}
    </Typography>
    <Typography component="h2" variant="h3" sx={{ lineHeight: 1.05 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={(theme) => ({ color: palette(theme).text.secondary })}>
      {text}
    </Typography>
    <ButtonBase
      disabled={disabled}
      onClick={onAction}
      sx={(theme) => ({
        alignSelf: 'flex-start',
        gap: 1,
        minHeight: '3rem',
        px: 2,
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: palette(theme).primary.main,
        color: palette(theme).primary.contrastText,
        transition: kkTokens.motion.press,
        '&:active': { transform: 'scale(0.97)' },
        '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
        ...focusRing(theme),
      })}
    >
      <KkEightsGlyph name={glyph} />
      <Typography component="span" variant="button">
        {action}
      </Typography>
    </ButtonBase>
  </Stack>
);
