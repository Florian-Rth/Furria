import type { FC } from 'react';
import type { RolePaneControl } from '../hooks/use-role-pane';
import type { RoleSummary } from '../schemas';
import { RoleHoldersTab } from './RoleHoldersTab';
import { RoleRightsTab } from './RoleRightsTab';
import { RoleSettingsTab } from './RoleSettingsTab';

interface RolePaneBodyProps {
  role: RoleSummary;
  catalogue: readonly string[];
  today: string;
  control: RolePaneControl;
  onEnd: (roleHoldingId: number) => void;
}

export const RolePaneBody: FC<RolePaneBodyProps> = ({ role, catalogue, today, control, onEnd }) => {
  switch (control.tab) {
    case 'holders':
      return <RoleHoldersTab role={role} today={today} control={control} onEnd={onEnd} />;
    case 'rights':
      return <RoleRightsTab role={role} catalogue={catalogue} control={control} />;
    case 'settings':
      return <RoleSettingsTab role={role} control={control} />;
  }
};
