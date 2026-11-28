import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ActCardDetailsHead } from '@/features/act-card/components/ActCardDetailsHead';
import { ChoreographyVersionsSection } from '@/features/act-studio/components/ChoreographyVersionsSection';
import { StudioHistorySection } from '@/features/act-studio/components/StudioHistorySection';
import { toActStateNote } from '../act-page-copy';
import type { ActDetailsPageState } from '../hooks/use-act-details-page';
import { ActCoEditorsSection } from './ActCoEditorsSection';
import { ActPageLoading } from './ActPageLoading';
import { ActSettingsSide } from './ActSettingsSide';

interface ActDetailsBodyProps {
  page: ActDetailsPageState;
}

export const ActDetailsBody: FC<ActDetailsBodyProps> = ({ page }) => {
  const data = page.query.data;

  if (data === undefined) {
    return <ActPageLoading load={page.load} />;
  }

  const stateNote = toActStateNote(data.act);
  const state = stateNote === null ? null : <KkMeta tone="accent">{stateNote}</KkMeta>;
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;
  const history =
    data.studio === null || !data.viewer.canEditStudio ? null : (
      <>
        <StudioHistorySection actId={data.act.actId} />
        <ChoreographyVersionsSection actId={data.act.actId} studio={data.studio} />
      </>
    );

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={page.masterSpan}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <ActCardDetailsHead data={data} viewerId={page.viewerId} search={page.search} />
          {state}
          {history}
          {coEditors}
        </Stack>
      </KkMasterDetail.Master>
      <ActSettingsSide page={page} act={data.act} />
    </KkMasterDetail>
  );
};
