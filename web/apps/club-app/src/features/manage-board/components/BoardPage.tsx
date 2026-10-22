import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BOARD_LEAD, BOARD_TITLE, NEW_OFFICE_LABEL, NEW_OFFICE_PATH } from '../board-hub-copy';
import { BoardBody } from './BoardBody';

const header = <KkTitleHeader title={BOARD_TITLE} lead={BOARD_LEAD} />;

export const BoardPage: FC = () => {
  const navigate = useNavigate();
  const actions: KkScreenActions = [
    {
      id: 'new-office',
      label: NEW_OFFICE_LABEL,
      icon: 'add',
      onSelect: () => {
        void navigate({ to: NEW_OFFICE_PATH });
      },
    },
  ];

  return (
    <KkScreen
      kind="list"
      title={BOARD_TITLE}
      origin={MANAGE_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
      actions={actions}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.boardManage}>
        <BoardBody />
      </RequirePermission>
    </KkScreen>
  );
};
