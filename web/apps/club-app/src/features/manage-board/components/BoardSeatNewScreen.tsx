import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { toBoardEntries, toBoardOfficeId } from '../manage-board-labels';
import { BoardEditorDenied } from './BoardEditorDenied';
import { BoardEditorNotFound } from './BoardEditorNotFound';
import { BoardEditorSkeleton } from './BoardEditorSkeleton';
import { BoardSeatEditor } from './BoardSeatEditor';

const ROUTE_ID = '/_app/manage/board_/$boardOfficeId_/seats/new';
const TITLE = 'Vorstandssitz eintragen';

export const BoardSeatNewScreen: FC = () => {
  const { boardOfficeId } = useParams({ from: ROUTE_ID });
  const { has } = usePermissions();
  const id = toBoardOfficeId(boardOfficeId);
  const board = useBoardQuery();

  if (!has(PERMISSION_KEYS.boardManage)) {
    return <BoardEditorDenied title={TITLE} />;
  }
  if (id === null) {
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

  return <BoardSeatEditor entry={entry} seat={null} />;
};
