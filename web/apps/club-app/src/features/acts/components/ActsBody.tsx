import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { toQueryErrorMessage } from '@/lib/query-error';
import { EMPTY_FILTER_NOTE, LOADING_LABEL, RETRY_LABEL } from '../acts-copy';
import { ACTS_ERROR_MESSAGES } from '../acts-messages';
import type { ActsHub } from '../hooks/use-acts-hub';
import { ActsCarriers } from './ActsCarriers';
import { ActsHealthStrip } from './ActsHealthStrip';
import { ActsList } from './ActsList';
import { ActsSessionChoice } from './ActsSessionChoice';
import { ActsSide } from './ActsSide';

interface ActsBodyProps {
  hub: ActsHub;
}

export const ActsBody: FC<ActsBodyProps> = ({ hub }) => {
  if (hub.query.data === undefined) {
    const message = toQueryErrorMessage(hub.query.error, ACTS_ERROR_MESSAGES);

    return message === null ? (
      <AppListSkeleton label={LOADING_LABEL} listShape="rows" />
    ) : (
      <KkRetryAlert
        message={message}
        retrying={hub.query.isFetching}
        onRetry={hub.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const masterSpan = hub.isSideOpen ? 7 : 12;
  const list =
    hub.sections.length === 0 ? <KkNote>{EMPTY_FILTER_NOTE}</KkNote> : <ActsList hub={hub} />;

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <ActsSessionChoice hub={hub} />
      <ActsHealthStrip hub={hub} />
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            <ActsCarriers hub={hub} />
            {list}
          </Stack>
        </KkMasterDetail.Master>
        <ActsSide hub={hub} />
      </KkMasterDetail>
    </Stack>
  );
};
