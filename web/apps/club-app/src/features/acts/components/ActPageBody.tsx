import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ActTrainingsSection } from '@/features/act-training/components/ActTrainingsSection';
import { CAST_ONLY_NOTE } from '../act-page-copy';
import type { ActPageState } from '../hooks/use-act-page';
import { ActCoEditorsSection } from './ActCoEditorsSection';
import { ActEveningPanel } from './ActEveningPanel';
import { ActEveningsSection } from './ActEveningsSection';
import { ActFacts } from './ActFacts';
import { ActPageLoading } from './ActPageLoading';
import { ActSettingsSide } from './ActSettingsSide';
import { ActStudioOverview } from './ActStudioOverview';

interface ActPageBodyProps {
  page: ActPageState;
}

export const ActPageBody: FC<ActPageBodyProps> = ({ page }) => {
  const data = page.query.data;

  if (data === undefined) {
    return <ActPageLoading page={page} />;
  }

  const studio =
    data.studio === null ? (
      <KkNote>{CAST_ONLY_NOTE}</KkNote>
    ) : (
      <ActStudioOverview studio={data.studio} viewerId={page.viewerId} />
    );
  const trainings = data.studio === null ? null : <ActTrainingsSection studio={data.studio} />;
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;
  const evenings =
    data.studio === null ? null : <ActEveningsSection data={data} studio={data.studio} />;
  const eveningPanel =
    data.studio === null || page.evening === null || !page.isEveningOpen ? null : (
      <ActEveningPanel
        key={page.evening.eventId}
        page={page}
        data={data}
        studio={data.studio}
        evening={page.evening}
      />
    );

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={page.masterSpan}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <ActFacts act={data.act} />
          {studio}
          {evenings}
          {trainings}
          {coEditors}
        </Stack>
      </KkMasterDetail.Master>
      <ActSettingsSide page={page} act={data.act} />
      {eveningPanel}
    </KkMasterDetail>
  );
};
