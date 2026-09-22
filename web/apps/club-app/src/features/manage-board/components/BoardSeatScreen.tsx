import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { toBoardEntries, toBoardOfficeId, toBoardSeatId } from '../manage-board-labels';
import { BoardEditorDenied } from './BoardEditorDenied';
import { BoardEditorNotFound } from './BoardEditorNotFound';
import { BoardEditorSkeleton } from './BoardEditorSkeleton';
import { BoardSeatEditor } from './BoardSeatEditor';

const ROUTE_ID = '/_app/manage/board_/$boardOfficeId_/seats/$boardSeatId';
const TITLE = 'Vorstandssitz beenden';

export const BoardSeatScreen: FC = () => {
  const { boardOfficeId, boardSeatId } = useParams({ from: ROUTE_ID });
  const { has } = usePermissions();
  const id = toBoardOfficeId(boardOfficeId);
  const seatId = toBoardSeatId(boardSeatId);
  const board = useBoardQuery();

  if (!has(PERMISSION_KEYS.boardManage)) {
    return <BoardEditorDenied title={TITLE} />;
  }
  if (id === null || seatId === null) {
    return <BoardEditorNotFound />;
  }
  if (board.data === undefined) {
    return board.isLoading ? <BoardEditorSkeleton /> : <BoardEditorNotFound />;
  }

  const entry = toBoardEntries(board.data.offices, toIsoDay(new Date())).find(
    (candidate) => candidate.boardOfficeId === id,
  );

  if (entry === undefined) {
    return <BoardEditorNotFound />;
  }

  const seat = entry.seats.find((candidate) => candidate.boardSeatId === seatId) ?? null;

  if (seat === null) {
    return <BoardEditorNotFound />;
  }

  return <BoardSeatEditor entry={entry} seat={seat} />;
};
