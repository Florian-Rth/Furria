import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { BOARD_TITLE, toBoardEntries, toBoardLead } from '../manage-board-labels';
import { BoardBody } from './BoardBody';

export const BoardPage: FC = () => {
  const board = useBoardQuery();
  const lead =
    board.data === undefined
      ? undefined
      : toBoardLead(toBoardEntries(board.data.offices, toIsoDay(new Date())));

  return (
    <KkScreen
      kind="list"
      title={BOARD_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={BOARD_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.boardManage}>
        <BoardBody />
      </RequirePermission>
    </KkScreen>
  );
};
