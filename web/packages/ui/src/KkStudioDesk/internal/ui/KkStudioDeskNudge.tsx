import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioDeskNudgeProps {
  text: string;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

export const KkStudioDeskNudge: FC<KkStudioDeskNudgeProps> = ({
  text,
  label,
  disabled,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    disabled={disabled}
    onClick={onPress}
    data-kk-studio-nudge
    sx={(theme) => ({
      minWidth: '2.75rem',
      height: '2.25rem',
      px: 1,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: palette(theme).text.primary,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      transition: 'background-color 160ms ease-out',
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
      },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 900, lineHeight: 1, color: 'inherit', fontVariantNumeric: 'tabular-nums' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
