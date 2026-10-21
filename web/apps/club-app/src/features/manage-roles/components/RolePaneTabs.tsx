import { KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import { toTabState } from '../roles-hub';
import { TABS, TABS_LABEL } from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary } from '../schemas';
import { RolePaneTabButton } from './RolePaneTabButton';

interface RolePaneTabsProps {
  tab: RolePaneTab;
  role: RoleSummary;
  onChoose: (tab: RolePaneTab) => void;
}

export const RolePaneTabs: FC<RolePaneTabsProps> = ({ tab, role, onChoose }) => {
  const tabs = TABS.map((view) => (
    <RolePaneTabButton
      key={view.id}
      view={view}
      state={toTabState(view.id, role)}
      selected={view.id === tab}
      onChoose={onChoose}
    />
  ));

  return <KkStepPane.Tabs label={TABS_LABEL}>{tabs}</KkStepPane.Tabs>;
};
