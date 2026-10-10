import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkNewsActionArea } from '../../../internal/news-surface/KkNewsActionArea';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';
import type { KkNewsLink } from '../../../internal/news-surface/news-link';

interface KkNewsRowRootProps extends PropsWithChildren {
  label: string;
  link: KkNewsLink | undefined;
  fit: KkNewsFit;
}

export const KkNewsRowRoot: FC<KkNewsRowRootProps> = ({ label, link, fit, children }) => (
  <KkNewsActionArea area="row" link={link} label={label} fit={fit}>
    <Stack
      direction="row"
      sx={{ width: '100%', gap: fitted(fit, { xs: 2, md: 3 }), alignItems: 'flex-start' }}
    >
      {children}
    </Stack>
  </KkNewsActionArea>
);
