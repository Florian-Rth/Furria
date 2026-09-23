import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { toBoardEntries, toBoardOfficeId, toBoardSeatId } from '../manage-board-labels';
import { toBoardErrorMessage } from '../manage-board-messages';
import { BoardEditorDenied } from './BoardEditorDenied';
import { BoardEditorError } from './BoardEditorError';
import { BoardEditorNotFound } from './BoardEditorNotFound';
import { BoardEditorSkeleton } from './BoardEditorSkeleton';
import { BoardSeatEditor } from './BoardSeatEditor';

const ROUTE_ID = '/_app/manage/board_/$boardOfficeId_/seats/$boardSeatId';
const TITLE = 'Vorstandssitz beenden';

export const BoardSeatScreen: FC = () => {
  const { boardOfficeId, boardSeatId } = useParams({ from: ROUTE_ID });
  const { has, isUndecided } = usePermissions();
  const id = toBoardOfficeId(boardOfficeId);
  const seatId = toBoardSeatId(boardSeatId);
  const board = useBoardQuery();
  const errorMessage = toBoardErrorMessage(board.error);

  const reload = (): void => {
    void board.refetch();
  };

  if (!isUndecided && !has(PERMISSION_KEYS.boardManage)) {
    return <BoardEditorDenied title={TITLE} />;
  }
  if (id === null || seatId === null) {
    return <BoardEditorNotFound />;
  }
  if (board.data !== undefined) {
    const entry = toBoardEntries(board.data.offices, toIsoDay(new Date())).find(
      (candidate) => candidate.boardOfficeId === id,
    );
    const seat = entry?.seats.find((candidate) => candidate.boardSeatId === seatId);

    if (entry === undefined || seat === undefined) {
      return <BoardEditorNotFound />;
    }

    return <BoardSeatEditor entry={entry} seat={seat} />;
  }
  if (errorMessage !== null) {
    return <BoardEditorError message={errorMessage} onRetry={reload} />;
  }

  return <BoardEditorSkeleton />;
};
