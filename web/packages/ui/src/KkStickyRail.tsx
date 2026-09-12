import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const FADE = `linear-gradient(to bottom, #000 calc(100% - ${kkTokens.layout.railFade}px), transparent 100%)`;

interface KkStickyRailProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStickyRail: FC<KkStickyRailProps> = ({ sx, children }) => (
  <Stack
    data-kk-sticky-rail
    sx={[
      {
        display: { xs: 'contents', desktop: 'block' },
        position: 'sticky',
        top: `${kkTokens.layout.stickyTop}px`,
        alignSelf: 'flex-start',
        maxHeight: `calc(100dvh - ${kkTokens.layout.stickyTop}px)`,
        overflowY: 'auto',
        minWidth: 0,
        pb: `${kkTokens.layout.railFade}px`,
        maskImage: FADE,
        WebkitMaskImage: FADE,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
