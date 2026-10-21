import { KkPanelSection, KkTenureChain } from '@furria/ui';
import type { FC } from 'react';
import { PAST_TITLE } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';
import { RolePastRow } from './RolePastRow';

interface RolePastGroupProps {
  holders: readonly RoleHolder[];
}

export const RolePastGroup: FC<RolePastGroupProps> = ({ holders }) => {
  if (holders.length === 0) {
    return null;
  }

  const rows = holders.map((holder) => <RolePastRow key={holder.roleHoldingId} holder={holder} />);

  return (
    <KkPanelSection title={PAST_TITLE} meta={holders.length}>
      <KkTenureChain label={PAST_TITLE}>{rows}</KkTenureChain>
    </KkPanelSection>
  );
};
