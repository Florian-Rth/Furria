import type { KkStepState } from '@furria/ui';
import { KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import type { TabView } from '../board-hub-copy';
import type { OfficePaneSection } from '../schemas';

interface OfficePaneTabProps {
  view: TabView;
  state: KkStepState;
  selected: boolean;
  onChoose: (tab: OfficePaneSection) => void;
}

export const OfficePaneTab: FC<OfficePaneTabProps> = ({ view, state, selected, onChoose }) => {
  const choose = (): void => {
    onChoose(view.id);
  };

  return (
    <KkStepPane.Tab
      icon={view.icon}
      state={state}
      label={view.label}
      selected={selected}
      onSelect={choose}
    />
  );
};
