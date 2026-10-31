import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkPracticeKeyGlyph } from './practice-key-glyphs';
import { PRACTICE_KEY_GLYPHS } from './practice-key-glyphs';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const keyPaint =
  (pressed: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    minHeight: kkTokens.tapTarget,
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    padding: theme.spacing(0.75, 1),
    borderRadius: `${kkTokens.radius.base}px`,
    backgroundColor: palette(theme).background.paper,
    color: pressed ? palette(theme).primary.main : palette(theme).text.primary,
    boxShadow: pressed
      ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`
      : `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    transition: kkTokens.motion.press,
    '&:active': { transform: 'scale(0.97)' },
    '&.Mui-disabled': { color: palette(theme).text.disabled },
    ...focusRing(theme),
  });

interface KkPracticeKeyProps {
  glyph: KkPracticeKeyGlyph;
  caption: string;
  label?: string;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkPracticeKey: FC<KkPracticeKeyProps> = ({
  glyph,
  caption,
  label,
  pressed,
  disabled = false,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    disabled={disabled}
    onClick={onPress}
    sx={keyPaint(pressed === true)}
  >
    {PRACTICE_KEY_GLYPHS[glyph]}
    <Typography
      variant="button"
      component="span"
      data-kk-practice-key-caption
      sx={{ textAlign: 'center', overflowWrap: 'anywhere', hyphens: 'auto', lineHeight: 1.2 }}
    >
      {caption}
    </Typography>
  </ButtonBase>
);
