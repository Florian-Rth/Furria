import type { FC } from 'react';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import type { RolePaneControl } from '../hooks/use-role-pane';
import type { RoleSummary } from '../schemas';
import { RoleHoldersTab } from './RoleHoldersTab';
import { RoleRightsTab } from './RoleRightsTab';
import { RoleSettingsTab } from './RoleSettingsTab';

interface RolePaneBodyProps {
  role: RoleSummary;
  today: string;
  control: RolePaneControl;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const RolePaneBody: FC<RolePaneBodyProps> = ({ role, today, control, onTask }) => {
  switch (control.tab) {
    case 'holders':
      return <RoleHoldersTab role={role} today={today} control={control} onTask={onTask} />;
    case 'rights':
      return <RoleRightsTab role={role} control={control} />;
    case 'settings':
      return <RoleSettingsTab role={role} control={control} />;
  }
};
