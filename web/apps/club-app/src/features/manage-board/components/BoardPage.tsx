import type { KkLoudScreenAction } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useBoardQuery } from '../api';
import { useBoardCreateDialog } from '../hooks/use-board-create-dialog';
import { BOARD_TITLE, toBoardEntries, toBoardLead } from '../manage-board-labels';
import { BoardBody } from './BoardBody';
import { BoardOfficeFormDialog } from './BoardOfficeFormDialog';

const CREATE_LABEL = 'Funktion anlegen';

export const BoardPage: FC = () => {
  const board = useBoardQuery();
  const create = useBoardCreateDialog();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.boardManage);
  const lead =
    board.data === undefined
      ? undefined
      : toBoardLead(toBoardEntries(board.data.offices, toIsoDay(new Date())));

  const createAction: KkLoudScreenAction = {
    id: 'create-board-office',
    label: CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: create.open,
  };

  const actions: readonly [KkLoudScreenAction] | undefined = canManage ? [createAction] : undefined;

  return (
    <KkScreen
      kind="list"
      title={BOARD_TITLE}
      origin={MANAGE_ORIGIN}
      actions={actions}
      header={<KkTitleHeader title={BOARD_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.boardManage}>
        <BoardBody onCreate={create.open} />
        <BoardOfficeFormDialog
          open={create.isOpen}
          editedOffice={null}
          onClose={create.close}
          onSaved={create.close}
        />
      </RequirePermission>
    </KkScreen>
  );
};
