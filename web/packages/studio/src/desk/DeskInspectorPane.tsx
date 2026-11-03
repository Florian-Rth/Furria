import { DeskHistoryPane } from '@furria/studio/DeskHistoryPane';
import { DeskSelectionPane } from '@furria/studio/DeskSelectionPane';
import { DESK_TAB_HISTORY, DESK_TAB_SELECTION, DESK_TABS } from '@furria/studio/desk-copy';
import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActDesk, DeskTab } from '@furria/studio/use-act-desk';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import type { VisitHistory } from '@furria/studio/visit-history';
import type { KkLaneInspectorTab } from '@furria/ui/KkLaneInspector';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC, ReactNode } from 'react';

interface DeskInspectorPaneProps {
  desk: ActDesk;
  borders: DeskBorders;
  setup: StudioSetup;
  history: VisitHistory;
}

const isTab = (key: string): key is DeskTab =>
  key === 'selection' || key === 'history' || key === 'setup';

export const DeskInspectorPane: FC<DeskInspectorPaneProps> = ({
  desk,
  borders,
  setup,
  history,
}) => {
  const setupTab: KkLaneInspectorTab[] = setup.shown
    ? [{ key: 'setup', text: SETUP_TITLE, aside: setup.progressText }]
    : [];
  const tabs: KkLaneInspectorTab[] = [
    { key: 'selection', text: DESK_TAB_SELECTION, aside: null },
    { key: 'history', text: DESK_TAB_HISTORY, aside: String(history.rows.length) },
    ...setupTab,
  ];
  const choose = (key: string): void => {
    if (isTab(key)) {
      desk.chooseTab(key);
    }
  };
  const panes: Record<DeskTab, ReactNode> = {
    selection: <DeskSelectionPane desk={desk} borders={borders} />,
    history: <DeskHistoryPane history={history} />,
    setup: <StudioSetupList setup={setup} />,
  };
  const pane = panes[desk.tab];

  return (
    <KkLaneInspector>
      <KkLaneInspector.Tabs label={DESK_TABS} tabs={tabs} current={desk.tab} onChoose={choose} />
      {pane}
    </KkLaneInspector>
  );
};
