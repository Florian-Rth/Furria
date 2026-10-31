import type { KkLaneInspectorTab } from '@furria/ui/KkLaneInspector';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC, ReactNode } from 'react';
import { StudioSetupList } from '@/features/act-studio/components/StudioSetupList';
import { useStudioHistory } from '@/features/act-studio/hooks/use-studio-history';
import type { StudioSetup } from '@/features/act-studio/hooks/use-studio-setup';
import { SETUP_TITLE } from '@/features/act-studio/setup-copy';
import { DESK_TAB_HISTORY, DESK_TAB_SELECTION, DESK_TABS } from '../desk-copy';
import type { ActDesk, DeskTab } from '../hooks/use-act-desk';
import type { DeskBorders } from '../hooks/use-desk-borders';
import { DeskHistoryPane } from './DeskHistoryPane';
import { DeskSelectionPane } from './DeskSelectionPane';

interface DeskInspectorPaneProps {
  desk: ActDesk;
  borders: DeskBorders;
  setup: StudioSetup;
}

const isTab = (key: string): key is DeskTab =>
  key === 'selection' || key === 'history' || key === 'setup';

export const DeskInspectorPane: FC<DeskInspectorPaneProps> = ({ desk, borders, setup }) => {
  const { screen } = desk;
  const { history } = useStudioHistory(screen.actId);
  const setupTab: KkLaneInspectorTab[] = setup.shown
    ? [{ key: 'setup', text: SETUP_TITLE, aside: setup.progressText }]
    : [];
  const tabs: KkLaneInspectorTab[] = [
    { key: 'selection', text: DESK_TAB_SELECTION, aside: null },
    { key: 'history', text: DESK_TAB_HISTORY, aside: String(history.entries.length) },
    ...setupTab,
  ];
  const choose = (key: string): void => {
    if (isTab(key)) {
      desk.chooseTab(key);
    }
  };
  const panes: Record<DeskTab, ReactNode> = {
    selection: <DeskSelectionPane desk={desk} borders={borders} />,
    history: <DeskHistoryPane actId={screen.actId} studio={screen.studio} />,
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
