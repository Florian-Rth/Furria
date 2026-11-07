import { DeskLanes } from '@furria/studio/DeskLanes';
import { DeskOverview } from '@furria/studio/DeskOverview';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkEjDesk } from '@furria/ui/KkEjDesk';
import { KkEjLaneFocus } from '@furria/ui/KkEjLaneFocus';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkStudioView } from '@furria/ui/KkStudioView';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deskFitOf, jobLaneOf } from '../edit-jobs';
import { EJ_BAR_LABEL, EJ_LANES, EJ_PAGE_LABEL, EJ_STAGE } from '../edit-jobs-copy';
import { useEjDesk } from '../hooks/use-ej-desk';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjDeskHead } from './EjDeskHead';
import { EjDeskPane } from './EjDeskPane';
import { EjJobSwitch } from './EjJobSwitch';
import { EjStage } from './EjStage';
import { EjStageHead } from './EjStageHead';
import { EjZoomTools } from './EjZoomTools';

interface EjDeskViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  versions: EjVersions;
}

export const EjDeskView: FC<EjDeskViewProps> = ({ screen, editor, versions }) => {
  const ej = useEjDesk(screen, editor);
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
        <EjDeskHead ej={ej} />
      </KkEjDesk.Area>
      <KkEjDesk.Area area="stage">
        <KkLaneDesk.Panel label={EJ_STAGE} padded>
          <EjStageHead screen={screen} editor={ej.stage} job={job} total={ej.arrange.placed} />
          <EjStage
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
            <EjJobSwitch jobs={ej.jobs} />
            <EjDeskPane ej={ej} versions={versions} />
          </KkEjPanel.Frame>
        </KkLaneDesk.Panel>
      </KkEjDesk.Area>
      <KkEjDesk.Area area="overview">
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <DeskOverview desk={ej.desk} centre={ej.lanes.centre} />
          </Stack>
          <EjZoomTools centre={ej.lanes.centre} />
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
