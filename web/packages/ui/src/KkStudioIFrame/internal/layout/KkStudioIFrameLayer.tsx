import Box from '@mui/material/Box';
import type { FC, KeyboardEvent, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const MOVE = `top 380ms ${EASE}, left 380ms ${EASE}, width 380ms ${EASE}, height 380ms ${EASE}, border-radius 380ms ${EASE}`;
const INSET_WIDTH = 'min(36%, 8.5rem)';

export type KkStudioIFrameRole = 'main' | 'inset';

interface KkStudioIFrameLayerProps extends PropsWithChildren {
  role: KkStudioIFrameRole;
  align?: 'center' | 'end';
  swapLabel: string;
  onSwap: () => void;
}

export const KkStudioIFrameLayer: FC<KkStudioIFrameLayerProps> = ({
  role,
  align = 'center',
  swapLabel,
  onSwap,
  children,
}) => {
  const inset = role === 'inset';
  const key = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (inset && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onSwap();
    }
  };
  const click = inset ? onSwap : undefined;

  return (
    <Box
      role={inset ? 'button' : undefined}
      tabIndex={inset ? 0 : undefined}
      aria-label={inset ? swapLabel : undefined}
      data-kk-studio-i-layer={role}
      onClick={click}
      onKeyDown={key}
      sx={(theme) => ({
        position: 'absolute',
        display: 'grid',
        placeItems: inset || align === 'center' ? 'center' : 'end center',
        containerType: 'size',
        overflow: 'clip',
        transition: MOVE,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        borderRadius: `${kkTokens.radius.base}px`,
        ...(inset
          ? {
              top: 0,
              left: `calc(100% - ${INSET_WIDTH})`,
              width: INSET_WIDTH,
              height: `calc(${INSET_WIDTH} * 9 / 16)`,
              zIndex: 5,
              cursor: 'pointer',
              borderRadius: `${kkTokens.radius.base * 0.75}px`,
              backgroundColor: (theme.vars ?? theme).palette.background.paper,
              boxShadow: `${kkTokens.shadow.floating}, 0 0 0 ${kkTokens.line.section}px ${(theme.vars ?? theme).palette.background.paper}`,
              '&::after': { content: '""', position: 'absolute', inset: 0, zIndex: 20 },
            }
          : {}),
        ...focusRing(theme),
      })}
    >
      {children}
    </Box>
  );
};
