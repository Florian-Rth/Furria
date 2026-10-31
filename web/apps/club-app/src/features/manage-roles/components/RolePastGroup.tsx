import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkTenureChain } from '@furria/ui/KkTenureChain';
import type { FC } from 'react';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import { PAST_TITLE } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';
import { RolePastRow } from './RolePastRow';

interface RolePastGroupProps {
  holders: readonly RoleHolder[];
  editable: boolean;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const RolePastGroup: FC<RolePastGroupProps> = ({ holders, editable, onTask }) => {
  if (holders.length === 0) {
    return null;
  }

  const rows = holders.map((holder) => (
    <RolePastRow key={holder.roleHoldingId} holder={holder} editable={editable} onTask={onTask} />
  ));

  return (
    <KkPanelSection title={PAST_TITLE}>
      <KkTenureChain label={PAST_TITLE}>{rows}</KkTenureChain>
    </KkPanelSection>
  );
};
