import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { INDEX_LABEL } from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import { SeasonIndexRow } from './SeasonIndexRow';

interface SeasonIndexListProps {
  keyPrefix: string;
}

export const SeasonIndexList: FC<SeasonIndexListProps> = ({ keyPrefix }) => {
  const board = useSeasonBoardContext();
  const rows = board.index.map((entry) => (
    <SeasonIndexRow key={entry.key} entry={entry} rowKey={`${keyPrefix}${entry.key}`} />
  ));

  return <KkNumberedList label={INDEX_LABEL}>{rows}</KkNumberedList>;
};
