import { DeskLanes } from '@furria/studio/DeskLanes';
import { DeskOverview } from '@furria/studio/DeskOverview';
import { JobDeskHead } from '@furria/studio/JobDeskHead';
import { JobDeskPane } from '@furria/studio/JobDeskPane';
import { JobStage } from '@furria/studio/JobStage';
import { JobStageHead } from '@furria/studio/JobStageHead';
import { JobSwitch } from '@furria/studio/JobSwitch';
import { JobZoomTools } from '@furria/studio/JobZoomTools';
import { JOB_BAR_LABEL, JOB_LANES, JOB_PAGE_LABEL, JOB_STAGE } from '@furria/studio/job-copy';
import { deskFitOf, jobLaneOf } from '@furria/studio/job-model';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useJobDesk } from '@furria/studio/use-job-desk';
import { KkEditorDesk } from '@furria/ui/KkEditorDesk';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneFocus } from '@furria/ui/KkLaneFocus';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

interface JobDeskViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  versions: ReactNode;
}

export const JobDeskView: FC<JobDeskViewProps> = ({ screen, editor, versions }) => {
  const jobDesk = useJobDesk(screen, editor);
  const { job } = jobDesk.jobs;
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const bigNames = job === 'cast';
  const named = job !== 'steps';
  const fit = deskFitOf(job);
  const lane = jobLaneOf(job);

  return (
    <KkEditorDesk label={JOB_PAGE_LABEL} fit={fit}>
      <KkEditorDesk.Area area="band">{band}</KkEditorDesk.Area>
      <KkEditorDesk.Area area="bar">
        <JobDeskHead jobDesk={jobDesk} />
      </KkEditorDesk.Area>
      <KkEditorDesk.Area area="stage">
        <KkLaneDesk.Panel label={JOB_STAGE} padded>
          <JobStageHead
            screen={screen}
            editor={jobDesk.stage}
            job={job}
            total={jobDesk.arrange.placed}
          />
          <JobStage
            screen={screen}
            editor={jobDesk.stage}
            arrange={jobDesk.arrange}
            label={JOB_STAGE}
            named={named}
            bigNames={bigNames}
            nameSize="large"
          />
        </KkLaneDesk.Panel>
      </KkEditorDesk.Area>
      <KkEditorDesk.Area area="pane">
        <KkLaneDesk.Panel label={JOB_BAR_LABEL}>
          <KkJobPanel.Frame>
            <JobSwitch jobs={jobDesk.jobs} />
            <JobDeskPane jobDesk={jobDesk} versions={versions} />
          </KkJobPanel.Frame>
        </KkLaneDesk.Panel>
      </KkEditorDesk.Area>
      <KkEditorDesk.Area area="overview">
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <DeskOverview desk={jobDesk.desk} centre={jobDesk.lanes.centre} />
          </Stack>
          <JobZoomTools centre={jobDesk.lanes.centre} />
        </Stack>
      </KkEditorDesk.Area>
      <KkEditorDesk.Area area="lanes">
        <KkLaneDesk.Panel label={JOB_LANES}>
          <KkLaneFocus row={lane}>
            <DeskLanes desk={jobDesk.desk} lanes={jobDesk.lanes} setup={jobDesk.setup} />
          </KkLaneFocus>
        </KkLaneDesk.Panel>
      </KkEditorDesk.Area>
      <StudioSetupInputs setup={jobDesk.setup} />
    </KkEditorDesk>
  );
};
