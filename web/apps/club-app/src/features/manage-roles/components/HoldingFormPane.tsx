import type { FC } from 'react';
import { useRoleQuery } from '../api';
import type { HoldingFormTarget } from '../hooks/use-holding-form-target';
import type { RoleSummary } from '../schemas';
import { HoldingEditPane } from './HoldingEditPane';
import { HoldingEndPane } from './HoldingEndPane';
import { HoldingOpenPane } from './HoldingOpenPane';

interface HoldingFormPaneProps {
  target: HoldingFormTarget;
  roles: readonly RoleSummary[];
  today: string;
  framed: boolean;
  onClose: () => void;
}

export const HoldingFormPane: FC<HoldingFormPaneProps> = ({
  target,
  roles,
  today,
  framed,
  onClose,
}) => {
  const details = useRoleQuery(target.roleId);
  const role = roles.find((candidate) => candidate.roleId === target.roleId);

  if (role === undefined) {
    return null;
  }

  if (target.mode === 'open') {
    return (
      <HoldingOpenPane
        key={`open-${role.roleId}`}
        role={role}
        today={today}
        framed={framed}
        onClose={onClose}
      />
    );
  }

  const holder = details.data?.holders.find(
    (candidate) => candidate.roleHoldingId === target.roleHoldingId,
  );

  if (holder === undefined) {
    return null;
  }

  if (target.mode === 'edit') {
    return (
      <HoldingEditPane
        key={holder.roleHoldingId}
        role={role}
        holder={holder}
        today={today}
        framed={framed}
        onClose={onClose}
      />
    );
  }

  return (
    <HoldingEndPane
      key={holder.roleHoldingId}
      role={role}
      holder={holder}
      today={today}
      framed={framed}
      onClose={onClose}
    />
  );
};
