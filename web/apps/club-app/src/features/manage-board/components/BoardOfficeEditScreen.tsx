import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { parsePositiveId } from '@/lib/positive-id';
import { useBoardQuery } from '../api';
import { toBoardEntries } from '../manage-board-labels';
import { toBoardErrorMessage } from '../manage-board-messages';
import { BoardEditorDenied } from './BoardEditorDenied';
import { BoardEditorError } from './BoardEditorError';
import { BoardEditorNotFound } from './BoardEditorNotFound';
import { BoardEditorSkeleton } from './BoardEditorSkeleton';
import { BoardOfficeEditor } from './BoardOfficeEditor';

const ROUTE_ID = '/_app/manage/board_/$boardOfficeId_/edit';
const TITLE = 'Vorstandsfunktion bearbeiten';

export const BoardOfficeEditScreen: FC = () => {
  const { boardOfficeId } = useParams({ from: ROUTE_ID });
  const { from } = useSearch({ from: ROUTE_ID });
  const returnTo = from === 'office' ? 'office' : 'hub';
  const { has, isUndecided } = usePermissions();
  const id = parsePositiveId(boardOfficeId);
  const board = useBoardQuery(has(PERMISSION_KEYS.boardManage));
  const errorMessage = toBoardErrorMessage(board.error);

  const reload = (): void => {
    void board.refetch();
  };

  if (!isUndecided && !has(PERMISSION_KEYS.boardManage)) {
    return <BoardEditorDenied title={TITLE} />;
  }
  if (id === null) {
    return <BoardEditorNotFound />;
  }
  if (board.data !== undefined && !isUndecided) {
    const entry = toBoardEntries(board.data.offices, toIsoDay(new Date())).find(
      (candidate) => candidate.boardOfficeId === id,
    );

    if (entry === undefined) {
      return <BoardEditorNotFound />;
    }

    return <BoardOfficeEditor entry={entry} returnTo={returnTo} />;
  }
  if (errorMessage !== null) {
    return <BoardEditorError message={errorMessage} onRetry={reload} />;
  }

  return <BoardEditorSkeleton />;
};
