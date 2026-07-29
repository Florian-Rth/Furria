import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const FeaturedAlbumScrim: FC = () => (
  <Box
    data-kk-featured-album-scrim
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      borderRadius: `${kkTokens.radius.base}px`,
      background: kkTokens.color.light.photoScrim,
      ...theme.applyStyles('dark', { background: kkTokens.color.dark.photoScrim }),
    })}
  />
);
