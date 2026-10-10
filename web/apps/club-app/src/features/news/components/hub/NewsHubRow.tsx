import { KkPressRow } from '@furria/ui';
import type { FC } from 'react';
import type { HubRow } from '../../hub-view';
import { CATEGORY_LABELS, CATEGORY_TONES, STAGE_WORDS } from '../../news-copy';
import { REGISTER_STATES, rowDateOf, rowFactOf, titleOf } from './hub-lines';

interface NewsHubRowProps {
  row: HubRow;
  order: number;
  highlighted: boolean;
  onOpen: (postId: string) => void;
}

export const NewsHubRow: FC<NewsHubRowProps> = ({ row, order, highlighted, onOpen }) => {
  const { category } = row;
  const title = titleOf(row.title);
  const categoryTag =
    category === null ? null : { label: CATEGORY_LABELS[category], tone: CATEGORY_TONES[category] };
  const label = `${title} · ${STAGE_WORDS[row.stage]}`;
  const rowId = String(row.id);
  const state = REGISTER_STATES[row.stage];
  const date = rowDateOf(row.date);
  const fact = rowFactOf(row.fact);

  const handleSelect = (): void => {
    onOpen(rowId);
  };

  return (
    <KkPressRow
      rowId={rowId}
      label={label}
      state={state}
      title={title}
      picture={row.pictureSource}
      category={categoryTag}
      date={date}
      fact={fact}
      highlighted={highlighted}
      order={order}
      onSelect={handleSelect}
    />
  );
};
