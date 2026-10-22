import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import type { RolePageControl } from '../hooks/use-role-page';
import { toRolesErrorMessage } from '../manage-roles-messages';
import { LOADING_LABEL, NOT_FOUND_TITLE, RETRY_LABEL } from '../roles-hub-copy';
import { HoldingFormHost } from './HoldingFormHost';
import { RolePane } from './RolePane';

interface RoleBodyProps {
  page: RolePageControl;
}

export const RoleBody: FC<RoleBodyProps> = ({ page }) => {
  if (page.query.data === undefined) {
    const message = toRolesErrorMessage(page.query.error);

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

  if (page.role === null) {
    return <KkNote>{NOT_FOUND_TITLE}</KkNote>;
  }

  const masterSpan = page.isWide && page.form.target !== null ? 7 : 12;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={masterSpan}>
        <RolePane
          role={page.role}
          catalogue={page.catalogue}
          today={page.today}
          requestedTab={null}
          framed={false}
          surface="page"
          onAddHolder={page.form.openHolding}
          onEndHolder={page.form.endHolding}
        />
      </KkMasterDetail.Master>
      <HoldingFormHost
        target={page.form.target}
        roles={page.roles}
        isWide={page.isWide}
        today={page.today}
        onClose={page.form.close}
      />
    </KkMasterDetail>
  );
};
