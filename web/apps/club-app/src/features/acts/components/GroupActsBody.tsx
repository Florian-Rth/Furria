import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { toQueryErrorMessage } from '@/lib/query-error';
import { LOADING_LABEL, RETRY_LABEL } from '../acts-copy';
import { ACTS_ERROR_MESSAGES } from '../acts-messages';
import type { GroupActHistory } from '../hooks/use-group-act-history';
import { GroupActsHistory } from './GroupActsHistory';
import { GroupActsSide } from './GroupActsSide';

interface GroupActsBodyProps {
  history: GroupActHistory;
}

export const GroupActsBody: FC<GroupActsBodyProps> = ({ history }) => {
  if (history.query.data === undefined) {
    const message = toQueryErrorMessage(history.query.error, ACTS_ERROR_MESSAGES);

    return message === null ? (
      <AppListSkeleton label={LOADING_LABEL} listShape="rows" />
    ) : (
      <KkRetryAlert
        message={message}
        retrying={history.query.isFetching}
        onRetry={history.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const masterSpan = history.isSideOpen ? 7 : 12;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={masterSpan}>
        <GroupActsHistory history={history} />
      </KkMasterDetail.Master>
      <GroupActsSide history={history} />
    </KkMasterDetail>
  );
};
