import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { LOADING_LABEL, NOT_FOUND_TITLE, RETRY_LABEL } from '../board-hub-copy';
import type { BoardOfficePageControl } from '../hooks/use-board-office-page';
import { toBoardErrorMessage } from '../manage-board-messages';
import { OfficePane } from './OfficePane';
import { SeatFormHost } from './SeatFormHost';

interface BoardOfficeBodyProps {
  page: BoardOfficePageControl;
}

export const BoardOfficeBody: FC<BoardOfficeBodyProps> = ({ page }) => {
  if (page.query.data === undefined) {
    const message = toBoardErrorMessage(page.query.error);

    return message === null ? (
      <AppListSkeleton label={LOADING_LABEL} listShape="rows" />
    ) : (
      <KkRetryAlert
        message={message}
        retrying={page.query.isFetching}
        onRetry={page.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  if (page.office === null) {
    return <KkNote>{NOT_FOUND_TITLE}</KkNote>;
  }

  const masterSpan = page.isWide && page.form.target !== null ? 7 : 12;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={masterSpan}>
        <OfficePane
          office={page.office}
          today={page.today}
          canManageRoles={page.canManageRoles}
          framed={false}
          surface="page"
          onOpenSeat={page.form.openSeat}
          onEndSeat={page.form.endSeat}
        />
      </KkMasterDetail.Master>
      <SeatFormHost
        target={page.form.target}
        offices={page.offices}
        isWide={page.isWide}
        today={page.today}
        onClose={page.form.close}
      />
    </KkMasterDetail>
  );
};
