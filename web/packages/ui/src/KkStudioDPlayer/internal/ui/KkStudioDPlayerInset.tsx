import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { crossFade, edgeOf, PLAYER_LAYER } from '../player-paint';

interface KkStudioDPlayerInsetProps extends PropsWithChildren {
  label: string;
  shown: boolean;
  aspect: number;
  onSwap: () => void;
}

export const KkStudioDPlayerInset: FC<KkStudioDPlayerInsetProps> = ({
  label,
  shown,
  aspect,
  onSwap,
  children,
}) => (
  <ButtonBase
    aria-label={label}
    aria-hidden={!shown}
    tabIndex={shown ? 0 : -1}
    onClick={onSwap}
    data-kk-studio-d-inset
    sx={(theme) => {
      const palette = (theme.vars ?? theme).palette;
      return {
        position: 'absolute',
        zIndex: PLAYER_LAYER.overlay,
        top: edgeOf('top', false),
        right: edgeOf('right', false),
        width: '7.75rem',
        aspectRatio: String(aspect),
        display: 'block',
        borderRadius: `${kkTokens.radius.base * 0.75}px`,
        backgroundColor: kkTokens.color.dark.darkroomEdge,
        border: `1px solid color-mix(in srgb, ${palette.text.primary} 22%, transparent)`,
        boxShadow: kkTokens.shadow.floating,
        overflow: 'clip',
        pointerEvents: shown ? 'auto' : 'none',
        transition: kkTokens.motion.press,
        '&:active': { transform: 'scale(.96)' },
        ...crossFade(shown),
        ...focusRing(theme),
        [theme.breakpoints.up('desktop')]: {
          top: edgeOf('top', true),
          right: edgeOf('right', true),
          width: '16rem',
        },
      };
    }}
  >
    {children}
  </ButtonBase>
);
