import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BOARD_LEAD, BOARD_TITLE } from '../manage-board-labels';
import { BoardBody } from './BoardBody';

export const BoardPage: FC = () => {
  return (
    <KkScreen
      kind="list"
      title={BOARD_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={BOARD_TITLE} lead={BOARD_LEAD} />}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.boardManage}>
        <BoardBody />
      </RequirePermission>
    </KkScreen>
  );
};
