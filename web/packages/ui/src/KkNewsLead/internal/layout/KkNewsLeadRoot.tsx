import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { KkNewsActionArea } from '../../../internal/news-surface/KkNewsActionArea';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';
import type { KkNewsLink } from '../../../internal/news-surface/news-link';

interface KkNewsLeadRootProps extends PropsWithChildren {
  label: string;
  link: KkNewsLink | undefined;
  fit: KkNewsFit;
}

export const KkNewsLeadRoot: FC<KkNewsLeadRootProps> = ({ label, link, fit, children }) => (
  <KkNewsActionArea area="lead" link={link} label={label} fit={fit}>
    <Grid
      container
      spacing={fitted(fit, { xs: 3, md: 6 })}
      sx={{ width: '100%', alignItems: 'center' }}
    >
      {children}
    </Grid>
  </KkNewsActionArea>
);
