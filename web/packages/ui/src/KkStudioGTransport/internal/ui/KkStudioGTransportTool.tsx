import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkStudioGTransportToolKind = 'loop' | 'zoomIn' | 'zoomOut';

const GLYPHS: Record<KkStudioGTransportToolKind, ReactNode> = {
  loop: <RepeatRoundedIcon />,
  zoomIn: <ZoomInRoundedIcon />,
  zoomOut: <ZoomOutRoundedIcon />,
};

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioGTransportToolProps {
  kind: KkStudioGTransportToolKind;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const KkStudioGTransportTool: FC<KkStudioGTransportToolProps> = ({
  kind,
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
    data-kk-studio-g-tool={kind}
    sx={(theme) => ({
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: pressed === true ? palette(theme).primary.contrastText : palette(theme).text.primary,
      backgroundColor: pressed === true ? palette(theme).primary.main : 'transparent',
      transition: `${kkTokens.motion.press}, background-color 160ms ease-out`,
      '&:active': { transform: 'scale(0.9)' },
      '&.Mui-disabled': { color: palette(theme).text.disabled },
      '& svg': { width: '1.25rem', height: '1.25rem' },
      ...focusRing(theme),
    })}
  >
    {GLYPHS[kind]}
  </ButtonBase>
);
