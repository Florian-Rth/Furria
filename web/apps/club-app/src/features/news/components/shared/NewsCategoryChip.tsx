import { KkNewsCategoryChip } from '@furria/ui';
import type { FC } from 'react';
import { CATEGORY_LABELS, CATEGORY_TONES } from '../../news-copy';
import type { NewsCategory } from '../../types';

interface NewsCategoryChipProps {
  category: NewsCategory;
}

export const NewsCategoryChip: FC<NewsCategoryChipProps> = ({ category }) => (
  <KkNewsCategoryChip tone={CATEGORY_TONES[category]} label={CATEGORY_LABELS[category]} />
);
