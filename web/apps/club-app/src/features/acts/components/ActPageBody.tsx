import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ActCardDetailsHead } from '@/features/act-card/components/ActCardDetailsHead';
import { ChoreographyVersionsSection } from '@/features/act-studio/components/ChoreographyVersionsSection';
import { StudioHistorySection } from '@/features/act-studio/components/StudioHistorySection';
import { VERSIONS_TITLE } from '@/features/act-studio/undo-copy';
import { ActTrainingRollPanel } from '@/features/act-training/components/ActTrainingRollPanel';
import { ActTrainingsSection } from '@/features/act-training/components/ActTrainingsSection';
import { CAST_ONLY_NOTE, toActStateNote } from '../act-page-copy';
import type { ActPageState } from '../hooks/use-act-page';
import { ActCoEditorsSection } from './ActCoEditorsSection';
import { ActEveningPanel } from './ActEveningPanel';
import { ActEveningsSection } from './ActEveningsSection';
import { ActPageLoading } from './ActPageLoading';
import { ActSettingsSide } from './ActSettingsSide';

interface ActPageBodyProps {
  page: ActPageState;
}

export const ActPageBody: FC<ActPageBodyProps> = ({ page }) => {
  const data = page.query.data;

  if (data === undefined) {
    return <ActPageLoading page={page} />;
  }

  const studio = data.studio === null ? <KkNote>{CAST_ONLY_NOTE}</KkNote> : null;
  const stateNote = toActStateNote(data.act);
  const state = stateNote === null ? null : <KkMeta tone="accent">{stateNote}</KkMeta>;
  const trainings =
    data.studio === null ? null : <ActTrainingsSection studio={data.studio} cast={data.act.cast} />;
  const coEditors = data.studio === null ? null : <ActCoEditorsSection page={data} />;
  const editedStudio = data.viewer.canEditStudio ? data.studio : null;
  const history =
    editedStudio === null ? null : (
      <>
        <StudioHistorySection actId={data.act.actId} studio={editedStudio} />
        <ChoreographyVersionsSection
          actId={data.act.actId}
          eventId={null}
          studio={editedStudio}
          title={VERSIONS_TITLE}
        />
      </>
    );
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
          {studio}
          {evenings}
          {trainings}
          {history}
          {coEditors}
        </Stack>
      </KkMasterDetail.Master>
      <ActSettingsSide page={page} act={data.act} />
      {eveningPanel}
      {rollPanel}
    </KkMasterDetail>
  );
};
