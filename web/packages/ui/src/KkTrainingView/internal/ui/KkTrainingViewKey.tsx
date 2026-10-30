import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const KEY_HEIGHT = '4.5rem';

const keyPaint =
  (strong: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      minHeight: KEY_HEIGHT,
      flexDirection: 'column',
      gap: theme.spacing(0.5),
      padding: theme.spacing(1.25, 1),
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: strong ? palette.primary.main : palette.background.paper,
      color: strong ? palette.primary.contrastText : palette.text.primary,
      boxShadow: strong ? 'none' : kkTokens.shadow.raised,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.96)' },
      '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
      ...focusRing(theme),
    };
  };

interface KkTrainingViewKeyProps {
  label: string;
  glyph: ReactNode;
  strong?: boolean;
  pressed?: boolean;
  disabled: boolean;
  onPress: () => void;
}

export const KkTrainingViewKey: FC<KkTrainingViewKeyProps> = ({
  label,
  glyph,
  strong = false,
  pressed,
  disabled,
  onPress,
}) => (
  <ButtonBase aria-pressed={pressed} disabled={disabled} onClick={onPress} sx={keyPaint(strong)}>
    {glyph}
    <Typography variant="button" component="span">
      {label}
    </Typography>
  </ButtonBase>
);
