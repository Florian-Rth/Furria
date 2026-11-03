import { DeskInspectorPane } from '@furria/studio/DeskInspectorPane';
import { DeskLanes } from '@furria/studio/DeskLanes';
import { DeskOverview } from '@furria/studio/DeskOverview';
import { DeskStageTools } from '@furria/studio/DeskStageTools';
import { DeskStageView } from '@furria/studio/DeskStageView';
import { DeskTopBar } from '@furria/studio/DeskTopBar';
import { DESK_INSPECTOR, DESK_LABEL, DESK_LANES, DESK_STAGE } from '@furria/studio/desk-copy';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { studioBandOf } from '@furria/studio/studio-copy';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActDesk } from '@furria/studio/use-act-desk';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import { useDeskLanes } from '@furria/studio/use-desk-lanes';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';

interface ActDeskViewProps {
  desk: ActDesk;
  setup: StudioSetup;
  history: VisitHistory;
  onMusic: () => void;
}

export const ActDeskView: FC<ActDeskViewProps> = ({ desk, setup, history, onMusic }) => {
  const { screen } = desk;
  const borders = useDeskBorders(screen);
  const lanes = useDeskLanes(desk, borders);
  useStudioKeys(scrubKeyActionsOf(screen, lanes.centre.zoomBy), true);
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;

  return (
    <KkLaneDesk label={DESK_LABEL}>
      <KkLaneDesk.Area area="band">{band}</KkLaneDesk.Area>
      <KkLaneDesk.Area area="bar">
        <DeskTopBar
          desk={desk}
          centre={lanes.centre}
          setup={setup}
          history={history}
          onMusic={onMusic}
        />
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="stage">
        <KkLaneDesk.Panel label={DESK_STAGE} padded>
          <DeskStageTools desk={desk} />
          <DeskStageView desk={desk} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="inspector">
        <KkLaneDesk.Panel label={DESK_INSPECTOR}>
          <DeskInspectorPane desk={desk} borders={borders} setup={setup} history={history} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="overview">
        <DeskOverview desk={desk} centre={lanes.centre} />
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="lanes">
        <KkLaneDesk.Panel label={DESK_LANES}>
          <DeskLanes desk={desk} lanes={lanes} setup={setup} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <StudioSetupInputs setup={setup} />
    </KkLaneDesk>
  );
};
