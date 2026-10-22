import { KkNote } from '@furria/ui/KkNote';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import type { RolePaneControl } from '../hooks/use-role-pane';
import { isRoleArchived, toSeatedOffices } from '../roles-hub';
import {
  ARCHIVED_HOLDERS_NOTE,
  CURRENT_TITLE,
  PLANNED_TITLE,
  RETRY_LABEL,
  toNobodyNote,
} from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { RoleHolderGroup } from './RoleHolderGroup';
import { RolePastGroup } from './RolePastGroup';

interface RoleHoldersTabProps {
  role: RoleSummary;
  today: string;
  control: RolePaneControl;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHoldersTab: FC<RoleHoldersTabProps> = ({ role, today, control, onEnd }) => {
  if (control.loadError !== null) {
    return (
      <KkRetryAlert
        message={control.loadError}
        retrying={control.isRetrying}
        onRetry={control.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const isArchived = isRoleArchived(role);
  const archivedNote = isArchived ? <KkNote>{ARCHIVED_HOLDERS_NOTE}</KkNote> : null;
  const nobody = isArchived ? undefined : toNobodyNote(toSeatedOffices(role));

  return (
    <>
      {archivedNote}
      <RoleHolderGroup
        title={CURRENT_TITLE}
        holders={control.groups.current}
        emptyNote={nobody}
        pending={control.holdersPending}
        today={today}
        canEnd={!isArchived}
        onEnd={onEnd}
      />
      <RoleHolderGroup
        title={PLANNED_TITLE}
        holders={control.groups.planned}
        pending={false}
        today={today}
        canEnd={false}
        onEnd={onEnd}
      />
      <RolePastGroup holders={control.past} />
    </>
  );
};
