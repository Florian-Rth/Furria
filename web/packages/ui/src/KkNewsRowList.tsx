import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkNewsFit } from './internal/news-surface/news-fit';
import { fitted } from './internal/news-surface/news-fit';

interface KkNewsRowListProps extends PropsWithChildren {
  fit?: KkNewsFit;
}

export const KkNewsRowList: FC<KkNewsRowListProps> = ({ fit = 'page', children }) => (
  <Stack data-kk-news-rows divider={<Divider />} sx={{ gap: fitted(fit, { xs: 1, md: 1.5 }) }}>
    {children}
  </Stack>
);
