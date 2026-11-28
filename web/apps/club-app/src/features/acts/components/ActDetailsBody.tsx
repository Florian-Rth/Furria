import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ActCardDetailsHead } from '@/features/act-card/components/ActCardDetailsHead';
import { ChoreographyVersionsSection } from '@/features/act-studio/components/ChoreographyVersionsSection';
import { StudioHistorySection } from '@/features/act-studio/components/StudioHistorySection';
import { ActTrainingRollPanel } from '@/features/act-training/components/ActTrainingRollPanel';
import { ActTrainingsSection } from '@/features/act-training/components/ActTrainingsSection';
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
  const trainings =
    data.studio === null ? null : (
      <ActTrainingsSection actId={data.act.actId} studio={data.studio} cast={data.act.cast} />
    );
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;
  const history =
    data.studio === null || !data.viewer.canEditStudio ? null : (
      <>
        <StudioHistorySection actId={data.act.actId} />
        <ChoreographyVersionsSection actId={data.act.actId} studio={data.studio} />
      </>
    );
  const rollPanel =
    data.studio === null || page.rollTraining === null || !page.isRollOpen ? null : (
      <ActTrainingRollPanel
        key={page.rollTraining.calendarEntryId}
        page={page}
        data={data}
        studio={data.studio}
        training={page.rollTraining}
      />
    );

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={page.masterSpan}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <ActCardDetailsHead data={data} viewerId={page.viewerId} search={page.search} />
          {state}
          {trainings}
          {history}
          {coEditors}
        </Stack>
      </KkMasterDetail.Master>
      <ActSettingsSide page={page} act={data.act} />
      {rollPanel}
    </KkMasterDetail>
  );
};
