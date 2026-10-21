import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BOARD_TITLE, HUB_ORIGIN } from '../board-hub-copy';
import { useBoardOfficePage } from '../hooks/use-board-office-page';
import { BoardOfficeBody } from './BoardOfficeBody';
import { BoardOfficeHeader } from './BoardOfficeHeader';

export const BoardOfficePage: FC = () => {
  const page = useBoardOfficePage();
  const title = page.office?.name ?? BOARD_TITLE;
  const pendingHeader = page.query.isPending ? <KkScreenHeaderSkeleton /> : null;
  const header =
    page.office === null ? (
      pendingHeader
    ) : (
      <BoardOfficeHeader office={page.office} today={page.today} />
    );

  return (
    <KkScreen
      kind="detail"
      title={title}
      origin={HUB_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.boardManage}>
        <BoardOfficeBody page={page} />
      </RequirePermission>
    </KkScreen>
  );
};
