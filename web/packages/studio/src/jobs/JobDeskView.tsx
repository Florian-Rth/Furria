import { DeskLanes } from '@furria/studio/DeskLanes';
import { DeskOverview } from '@furria/studio/DeskOverview';
import { deskFitOf, jobLaneOf } from '@furria/studio/edit-jobs';
import { EJ_BAR_LABEL, EJ_LANES, EJ_PAGE_LABEL, EJ_STAGE } from '@furria/studio/edit-jobs-copy';
import { JobDeskHead } from '@furria/studio/JobDeskHead';
import { JobDeskPane } from '@furria/studio/JobDeskPane';
import { JobStage } from '@furria/studio/JobStage';
import { JobStageHead } from '@furria/studio/JobStageHead';
import { JobSwitch } from '@furria/studio/JobSwitch';
import { JobZoomTools } from '@furria/studio/JobZoomTools';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useJobDesk } from '@furria/studio/use-job-desk';
import { KkEjDesk } from '@furria/ui/KkEjDesk';
import { KkEjLaneFocus } from '@furria/ui/KkEjLaneFocus';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface JobDeskViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  versions: ReactNode;
}

export const JobDeskView: FC<JobDeskViewProps> = ({ screen, editor, versions }) => {
  const ej = useJobDesk(screen, editor);
  const { job } = ej.jobs;
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const bigNames = job === 'cast';
  const named = job !== 'steps';
  const fit = deskFitOf(job);
  const lane = jobLaneOf(job);

  return (
    <KkEjDesk label={EJ_PAGE_LABEL} fit={fit}>
      <KkEjDesk.Area area="band">{band}</KkEjDesk.Area>
      <KkEjDesk.Area area="bar">
        <JobDeskHead ej={ej} />
      </KkEjDesk.Area>
      <KkEjDesk.Area area="stage">
        <KkLaneDesk.Panel label={EJ_STAGE} padded>
          <JobStageHead screen={screen} editor={ej.stage} job={job} total={ej.arrange.placed} />
          <JobStage
            screen={screen}
            editor={ej.stage}
            arrange={ej.arrange}
            label={EJ_STAGE}
            named={named}
            bigNames={bigNames}
            nameSize="large"
          />
        </KkLaneDesk.Panel>
      </KkEjDesk.Area>
      <KkEjDesk.Area area="pane">
        <KkLaneDesk.Panel label={EJ_BAR_LABEL}>
          <KkEjPanel.Frame>
            <JobSwitch jobs={ej.jobs} />
            <JobDeskPane ej={ej} versions={versions} />
          </KkEjPanel.Frame>
        </KkLaneDesk.Panel>
      </KkEjDesk.Area>
      <KkEjDesk.Area area="overview">
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <DeskOverview desk={ej.desk} centre={ej.lanes.centre} />
          </Stack>
          <JobZoomTools centre={ej.lanes.centre} />
        </Stack>
      </KkEjDesk.Area>
      <KkEjDesk.Area area="lanes">
        <KkLaneDesk.Panel label={EJ_LANES}>
          <KkEjLaneFocus row={lane}>
            <DeskLanes desk={ej.desk} lanes={ej.lanes} setup={ej.setup} />
          </KkEjLaneFocus>
        </KkLaneDesk.Panel>
      </KkEjDesk.Area>
      <StudioSetupInputs setup={ej.setup} />
    </KkEjDesk>
  );
};
