import type { KkLaneInspectorTab } from '@furria/ui/KkLaneInspector';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC, ReactNode } from 'react';
import { useStudioHistory } from '@/features/act-studio/hooks/use-studio-history';
import { DESK_TAB_HISTORY, DESK_TAB_SELECTION, DESK_TABS } from '../desk-copy';
import type { ActDesk, DeskTab } from '../hooks/use-act-desk';
import type { DeskBorders } from '../hooks/use-desk-borders';
import { DeskHistoryPane } from './DeskHistoryPane';
import { DeskSelectionPane } from './DeskSelectionPane';

interface DeskInspectorPaneProps {
  desk: ActDesk;
  borders: DeskBorders;
}

const isTab = (key: string): key is DeskTab => key === 'selection' || key === 'history';

export const DeskInspectorPane: FC<DeskInspectorPaneProps> = ({ desk, borders }) => {
  const { screen } = desk;
  const { history } = useStudioHistory(screen.actId);
  const tabs: KkLaneInspectorTab[] = [
    { key: 'selection', text: DESK_TAB_SELECTION, aside: null },
    { key: 'history', text: DESK_TAB_HISTORY, aside: String(history.entries.length) },
  ];
  const choose = (key: string): void => {
    if (isTab(key)) {
      desk.chooseTab(key);
    }
  };
  const panes: Record<DeskTab, ReactNode> = {
    selection: <DeskSelectionPane desk={desk} borders={borders} />,
    history: <DeskHistoryPane actId={screen.actId} studio={screen.studio} />,
  };
  const pane = panes[desk.tab];

  return (
    <KkLaneInspector>
      <KkLaneInspector.Tabs label={DESK_TABS} tabs={tabs} current={desk.tab} onChoose={choose} />
      {pane}
    </KkLaneInspector>
  );
};
