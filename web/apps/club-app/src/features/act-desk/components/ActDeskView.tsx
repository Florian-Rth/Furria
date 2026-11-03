import { DESK_INSPECTOR, DESK_LABEL, DESK_LANES, DESK_STAGE } from '@furria/studio/desk-copy';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { StudioSetupInputs } from '@/features/act-studio/components/StudioSetupInputs';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioSetup } from '@/features/act-studio/hooks/use-studio-setup';
import { scrubKeyActionsOf } from '@/features/act-studio/studio-key-actions';
import { useActDesk } from '../hooks/use-act-desk';
import { useDeskBorders } from '../hooks/use-desk-borders';
import { useDeskLanes } from '../hooks/use-desk-lanes';
import { DeskInspectorPane } from './DeskInspectorPane';
import { DeskLanes } from './DeskLanes';
import { DeskOverview } from './DeskOverview';
import { DeskStageTools } from './DeskStageTools';
import { DeskStageView } from './DeskStageView';
import { DeskTopBar } from './DeskTopBar';

interface ActDeskViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActDeskView: FC<ActDeskViewProps> = ({ screen, editor }) => {
  const takes = useActStudioTakes(screen);
  const desk = useActDesk(screen, editor, takes);
  const borders = useDeskBorders(screen);
  const lanes = useDeskLanes(desk, borders);
  useStudioKeys(scrubKeyActionsOf(screen, lanes.centre.zoomBy), true);
  const setup = useStudioSetup(screen, editor, {
    leave: () => {
      desk.chooseTab('selection');
    },
    showStep: desk.focusStep,
    showSpots: desk.focusSpots,
  });
  const band =
    screen.eveningBand === null ? null : <KkStudioView.BandNote text={screen.eveningBand} />;

  return (
    <KkLaneDesk label={DESK_LABEL}>
      <KkLaneDesk.Area area="band">{band}</KkLaneDesk.Area>
      <KkLaneDesk.Area area="bar">
        <DeskTopBar desk={desk} centre={lanes.centre} setup={setup} />
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="stage">
        <KkLaneDesk.Panel label={DESK_STAGE} padded>
          <DeskStageTools desk={desk} />
          <DeskStageView desk={desk} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="inspector">
        <KkLaneDesk.Panel label={DESK_INSPECTOR}>
          <DeskInspectorPane desk={desk} borders={borders} setup={setup} />
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
