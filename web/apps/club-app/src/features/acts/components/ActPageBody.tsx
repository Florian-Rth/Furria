import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { toQueryErrorMessage } from '@/lib/query-error';
import { ACT_LOADING_LABEL, CAST_ONLY_NOTE } from '../act-page-copy';
import { RETRY_LABEL } from '../acts-copy';
import { ACTS_ERROR_MESSAGES } from '../acts-messages';
import type { ActPageState } from '../hooks/use-act-page';
import { ActCoEditorsSection } from './ActCoEditorsSection';
import { ActFacts } from './ActFacts';
import { ActSettingsSide } from './ActSettingsSide';
import { ActStudioOverview } from './ActStudioOverview';

const SKELETON_LINES = 8;

interface ActPageBodyProps {
  page: ActPageState;
}

export const ActPageBody: FC<ActPageBodyProps> = ({ page }) => {
  const data = page.query.data;

  if (data === undefined) {
    const message = toQueryErrorMessage(page.query.error, ACTS_ERROR_MESSAGES);

    return message === null ? (
      <AppSkeletonRegion label={ACT_LOADING_LABEL}>
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </AppSkeletonRegion>
    ) : (
      <KkRetryAlert
        message={message}
        retrying={page.query.isFetching}
        onRetry={page.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const studio =
    data.studio === null ? (
      <KkNote>{CAST_ONLY_NOTE}</KkNote>
    ) : (
      <ActStudioOverview studio={data.studio} viewerId={page.viewerId} />
    );
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={page.masterSpan}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <ActFacts act={data.act} />
          {studio}
          {coEditors}
        </Stack>
      </KkMasterDetail.Master>
      <ActSettingsSide page={page} act={data.act} />
    </KkMasterDetail>
  );
};
