import type { KkStepState } from '@furria/ui';
import { KkStepPane } from '@furria/ui';
import type { FC } from 'react';
import type { TabView } from '../roles-hub-copy';
import type { RolePaneTab } from '../schemas';

interface RolePaneTabButtonProps {
  view: TabView;
  state: KkStepState;
  selected: boolean;
  onChoose: (tab: RolePaneTab) => void;
}

export const RolePaneTabButton: FC<RolePaneTabButtonProps> = ({
  view,
  state,
  selected,
  onChoose,
}) => {
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
