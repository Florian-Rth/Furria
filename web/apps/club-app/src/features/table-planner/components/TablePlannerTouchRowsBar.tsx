import { KkPlanActionBar } from '@furria/ui/KkPlanActionBar';
import type { FC, ReactNode } from 'react';
import type { TouchActionItem } from '../hooks/use-touch-actions';
import { useTouchActions } from '../hooks/use-touch-actions';
import { ACTION_BAR_LABEL } from '../table-planner-copy';

const itemOf = (item: TouchActionItem): ReactNode => {
  if (item.kind === 'readout') {
    return <KkPlanActionBar.Readout key={item.id} value={item.value} label={item.label} />;
  }
  if (item.kind === 'divider') {
    return <KkPlanActionBar.Divider key={item.id} />;
  }

  return (
    <KkPlanActionBar.Button
      key={item.id}
      id={item.id}
      label={item.label}
      icon={item.icon}
      tone={item.danger ? 'danger' : 'ink'}
      narrowHidden={item.narrowHidden}
      onClick={item.onClick}
    />
  );
};

export const TablePlannerTouchRowsBar: FC = () => {
  const items = useTouchActions().map(itemOf);

  return <KkPlanActionBar label={ACTION_BAR_LABEL}>{items}</KkPlanActionBar>;
};
