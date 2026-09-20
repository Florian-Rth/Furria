import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { toBoardEntries } from '../manage-board-labels';
import { toBoardErrorMessage } from '../manage-board-messages';
import { BoardError } from './BoardError';
import { BoardView } from './BoardView';

const LOADING_LABEL = 'Der Vorstand wird geladen';

interface BoardBodyProps {
  onCreate: () => void;
}

export const BoardBody: FC<BoardBodyProps> = ({ onCreate }) => {
  const board = useBoardQuery();
  const errorMessage = toBoardErrorMessage(board.error);

  const reload = (): void => {
    void board.refetch();
  };

  if (board.data !== undefined) {
    const entries = toBoardEntries(board.data.offices, toIsoDay(new Date()));

    return <BoardView entries={entries} onCreate={onCreate} />;
  }
  if (errorMessage !== null) {
    return <BoardError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
