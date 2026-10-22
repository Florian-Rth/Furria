import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import { TABS, TABS_LABEL } from '../board-hub-copy';
import type { OfficePaneSection } from '../schemas';
import { OfficePaneTab } from './OfficePaneTab';

interface OfficePaneTabsProps {
  tab: OfficePaneSection;
  needsWork: boolean;
  isArchived: boolean;
  onChoose: (tab: OfficePaneSection) => void;
}

export const OfficePaneTabs: FC<OfficePaneTabsProps> = ({
  tab,
  needsWork,
  isArchived,
  onChoose,
}) => {
  const seatsState = isArchived ? 'off' : needsWork ? 'overdue' : 'done';
  const tabs = TABS.map((view) => {
    const state = view.id === 'seats' ? seatsState : 'open';

    return (
      <OfficePaneTab
        key={view.id}
        view={view}
        state={state}
        selected={view.id === tab}
        onChoose={onChoose}
      />
    );
  });

  return <KkStepPane.Tabs label={TABS_LABEL}>{tabs}</KkStepPane.Tabs>;
};
