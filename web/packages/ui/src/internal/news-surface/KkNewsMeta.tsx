import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkNewsCategoryChip } from '../../KkNewsCategoryChip';
import type { KkNewsCategory } from './news-category';

interface KkNewsMetaProps extends PropsWithChildren {
  category: KkNewsCategory | null;
}

export const KkNewsMeta: FC<KkNewsMetaProps> = ({ category, children }) => {
  const chip =
    category === null ? null : <KkNewsCategoryChip tone={category.tone} label={category.label} />;

  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      {chip}
      {children}
    </Stack>
  );
};
