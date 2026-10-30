import type { KkLaneInspectorTab } from '@furria/ui/KkLaneInspector';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC, ReactNode } from 'react';
import { useStudioHistory } from '@/features/act-studio/hooks/use-studio-history';
import type { LaneBorders } from '../hooks/use-lane-borders';
import type { LaneEditor, LaneTab } from '../hooks/use-lane-editor';
import {
  LANE_TAB_HISTORY,
  LANE_TAB_SELECTION,
  LANE_TAB_SETUP,
  LANE_TABS,
  progressTextOf,
} from '../lane-copy';
import { LaneHistoryPane } from './LaneHistoryPane';
import { LaneSelectionPane } from './LaneSelectionPane';
import { LaneSetupList } from './LaneSetupList';

interface LaneInspectorPaneProps {
  lane: LaneEditor;
  borders: LaneBorders;
}

const isTab = (key: string): key is LaneTab =>
  key === 'selection' || key === 'history' || key === 'setup';

export const LaneInspectorPane: FC<LaneInspectorPaneProps> = ({ lane, borders }) => {
  const { screen, setup } = lane;
  const { history } = useStudioHistory(screen.actId);
  const tabs: KkLaneInspectorTab[] = [
    { key: 'selection', text: LANE_TAB_SELECTION, aside: null },
    { key: 'history', text: LANE_TAB_HISTORY, aside: String(history.entries.length) },
    { key: 'setup', text: LANE_TAB_SETUP, aside: progressTextOf(setup.done, setup.total) },
  ];
  const choose = (key: string): void => {
    if (isTab(key)) {
      lane.chooseTab(key);
    }
  };
  const panes: Record<LaneTab, ReactNode> = {
    selection: <LaneSelectionPane lane={lane} borders={borders} />,
    history: <LaneHistoryPane actId={screen.actId} studio={screen.studio} />,
    setup: <LaneSetupList lane={lane} onLeave={lane.closeSetup} />,
  };
  const pane = panes[lane.tab];

  return (
    <KkLaneInspector>
      <KkLaneInspector.Tabs label={LANE_TABS} tabs={tabs} current={lane.tab} onChoose={choose} />
      {pane}
    </KkLaneInspector>
  );
};
