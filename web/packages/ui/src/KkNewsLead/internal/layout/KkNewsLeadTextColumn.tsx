import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsLeadTextColumnProps extends PropsWithChildren {
  fit: KkNewsFit;
}

export const KkNewsLeadTextColumn: FC<KkNewsLeadTextColumnProps> = ({ fit, children }) => (
  <Grid
    data-kk-news-lead-text
    size={fitted(fit, { xs: 12, md: 6 })}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: fitted(fit, { xs: 1.5, md: 2 }),
    }}
  >
    {children}
  </Grid>
);
