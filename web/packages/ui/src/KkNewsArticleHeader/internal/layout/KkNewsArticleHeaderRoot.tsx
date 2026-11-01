import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkNewsArticleHeaderRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkNewsArticleHeaderRoot: FC<KkNewsArticleHeaderRootProps> = ({ sx, children }) => (
  <Stack
    component="header"
    data-kk-news-post-header
    sx={[
      { gap: { xs: 1.5, md: 2 }, alignItems: 'flex-start', minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
