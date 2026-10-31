import { KkStepPane } from '@furria/ui/KkStepPane';
import type { KkStickyFootSurface } from '@furria/ui/KkStickyFoot';
import type { FC, ReactNode } from 'react';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import { useRolePane } from '../hooks/use-role-pane';
import type { RolePaneTab, RoleSummary } from '../schemas';
import { ArchiveRoleDialog } from './ArchiveRoleDialog';
import { RestoreRoleDialog } from './RestoreRoleDialog';
import { RolePaneBody } from './RolePaneBody';
import { RolePaneFoot } from './RolePaneFoot';
import { RolePaneHead } from './RolePaneHead';
import { RolePaneTabs } from './RolePaneTabs';

interface RolePaneProps {
  role: RoleSummary;
  catalogue: readonly string[];
  today: string;
  requestedTab: RolePaneTab | null;
  framed: boolean;
  surface: KkStickyFootSurface;
  actions?: ReactNode;
  onAddHolder: (roleId: number) => void;
  onHolderTask: (roleId: number, roleHoldingId: number, task: HoldingTask) => void;
}

export const RolePane: FC<RolePaneProps> = ({
  role,
  catalogue,
  today,
  requestedTab,
  framed,
  surface,
  actions,
  onAddHolder,
  onHolderTask,
}) => {
  const control = useRolePane(role, catalogue, requestedTab, today);
  const takeUp = (roleHoldingId: number, task: HoldingTask): void => {
    onHolderTask(role.roleId, roleHoldingId, task);
  };
  const add = (): void => {
    onAddHolder(role.roleId);
  };
  const head =
    surface === 'page' ? null : (
      <RolePaneHead role={role} totalKeys={catalogue.length} actions={actions} />
    );

  return (
    <KkStepPane label={role.name} framed={framed}>
      {head}
      <RolePaneTabs tab={control.tab} role={role} onChoose={control.chooseTab} />
      <KkStepPane.Body>
        <RolePaneBody role={role} today={today} control={control} onTask={takeUp} />
      </KkStepPane.Body>
      <RolePaneFoot
        role={role}
        control={control}
        surface={surface}
        onPage={surface === 'page'}
        onAdd={add}
      />
      <ArchiveRoleDialog
        role={role}
        open={control.archiveOpen}
        onClose={control.closeDialogs}
        lifecycle={control.lifecycle}
      />
      <RestoreRoleDialog
        role={role}
        open={control.restoreOpen}
        onClose={control.closeDialogs}
        lifecycle={control.lifecycle}
      />
    </KkStepPane>
  );
};
