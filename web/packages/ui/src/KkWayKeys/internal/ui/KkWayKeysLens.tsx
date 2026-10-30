import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkWayKeysLensProps {
  near: boolean;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

export const KkWayKeysLens: FC<KkWayKeysLensProps> = ({
  near,
  label,
  disabled = false,
  onPress,
}) => {
  const glyph = near ? (
    <ZoomOutMapRoundedIcon fontSize="small" />
  ) : (
    <CenterFocusStrongRoundedIcon fontSize="small" />
  );

  return (
    <ButtonBase
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      data-kk-way-lens
      sx={(theme) => ({
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        borderRadius: `${kkTokens.radius.pill}px`,
        color: palette(theme).text.secondary,
        transition: kkTokens.motion.press,
        '&:active': { transform: 'scale(0.9)' },
        '&.Mui-disabled': { opacity: 0 },
        ...focusRing(theme),
      })}
    >
      {glyph}
    </ButtonBase>
  );
};
