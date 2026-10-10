import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsRowTextProps extends PropsWithChildren {
  fit: KkNewsFit;
}

export const KkNewsRowText: FC<KkNewsRowTextProps> = ({ fit, children }) => (
  <Stack sx={{ gap: fitted(fit, { xs: 0.75, md: 1 }), minWidth: 0, flexGrow: 1 }}>{children}</Stack>
);
