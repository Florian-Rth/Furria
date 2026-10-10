import type { KkKickerOption } from '@furria/ui';
import { KkKickerMenu } from '@furria/ui';
import type { FC } from 'react';
import { CATEGORY_CHOOSE, CATEGORY_MENU_LABEL } from '../../editor-copy';
import { CATEGORY_LABELS } from '../../news-copy';
import type { NewsCategory } from '../../types';
import { NEWS_CATEGORIES } from '../../types';
import { NewsCategoryChip } from '../shared/NewsCategoryChip';

interface NewsCategoryKickerProps {
  category: NewsCategory | null;
  isReadOnly: boolean;
  onChoose: (category: NewsCategory) => void;
}

const OPTIONS: readonly KkKickerOption[] = NEWS_CATEGORIES.map((category) => ({
  id: category,
  text: CATEGORY_LABELS[category],
  face: <NewsCategoryChip category={category} />,
}));

const categoryOf = (id: string): NewsCategory | null =>
  NEWS_CATEGORIES.find((category) => category === id) ?? null;

export const NewsCategoryKicker: FC<NewsCategoryKickerProps> = ({
  category,
  isReadOnly,
  onChoose,
}) => {
  const face = category === null ? null : <NewsCategoryChip category={category} />;
  const handleChoose = (id: string): void => {
    const chosen = categoryOf(id);
    if (chosen !== null) {
      onChoose(chosen);
    }
  };

  return (
    <KkKickerMenu
      id="news-field-category"
      label={CATEGORY_MENU_LABEL}
      emptyLabel={CATEGORY_CHOOSE}
      selected={category}
      face={face}
      options={OPTIONS}
      disabled={isReadOnly}
      onChoose={handleChoose}
    />
  );
};
