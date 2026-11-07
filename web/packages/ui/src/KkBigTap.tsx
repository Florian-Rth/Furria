import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent } from 'react';
import { inkFocusRing } from './internal/ink-focus-ring';
import { kkTokens } from './tokens';

interface KkBigTapProps {
  text: string;
  meta: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

const TAP_HEIGHT = '4rem';
const PRESSED_SCALE = 0.97;
const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkBigTap: FC<KkBigTapProps> = ({ text, meta, label, disabled, onPress }) => {
  const pressByKey = (event: MouseEvent<HTMLButtonElement>): void => {
    if (event.detail === 0) {
      onPress();
    }
  };

  return (
    <ButtonBase
      aria-label={label}
      disabled={disabled}
      onPointerDown={onPress}
      onClick={pressByKey}
      data-kk-big-tap
      sx={(theme) => ({
        width: '100%',
        minHeight: TAP_HEIGHT,
        flexDirection: 'column',
        gap: 0.25,
        borderRadius: `${kkTokens.radius.base}px`,
        color: palette(theme).background.paper,
        backgroundColor: palette(theme).text.primary,
        touchAction: 'none',
        transition: 'transform 90ms ease-out',
        '&:active': { transform: `scale(${PRESSED_SCALE})` },
        '&.Mui-disabled': {
          color: palette(theme).text.disabled,
          backgroundColor: palette(theme).action.disabledBackground,
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        ...inkFocusRing(theme),
      })}
    >
      <Typography component="span" variant="h3" sx={{ color: 'inherit' }}>
        {text}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        aria-live="polite"
        sx={{ color: 'inherit', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
      >
        {meta}
      </Typography>
    </ButtonBase>
  );
};
