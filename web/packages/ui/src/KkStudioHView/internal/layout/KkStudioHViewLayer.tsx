import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const HIDE = `opacity 220ms ease-out, transform 380ms ${EASE}, visibility 0s linear 380ms`;
const SHOW = `opacity 260ms ease-out 100ms, transform 380ms ${EASE}, visibility 0s`;

interface KkStudioHViewLayerProps extends PropsWithChildren {
  shown: boolean;
}

export const KkStudioHViewLayer: FC<KkStudioHViewLayerProps> = ({ shown, children }) => (
  <Stack
    aria-hidden={!shown}
    data-shown={shown}
    sx={{
      gridArea: 'strip',
      minWidth: 0,
      minHeight: 0,
      justifyContent: 'flex-end',
      gap: { xs: 1, desktop: 1.5 },
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateY(0.5rem) scaleY(0.92)',
      transformOrigin: 'bottom center',
      transition: HIDE,
      '&[data-shown="true"]': {
        opacity: 1,
        visibility: 'visible',
        transform: 'none',
        transition: SHOW,
      },
      '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
    }}
  >
    {children}
  </Stack>
);
