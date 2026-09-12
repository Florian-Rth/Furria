import { KkFactRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { formatPeriod } from '@/lib/membership-labels';
import { ROLE_SECTION_TITLES, toPersonName } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

interface RolePastHoldersPanelProps {
  holders: readonly RoleHolder[];
}

export const RolePastHoldersPanel: FC<RolePastHoldersPanelProps> = ({ holders }) => {
  if (holders.length === 0) {
    return null;
  }

  const rows = holders.map((holder) => (
    <KkFactRow
      key={holder.roleHoldingId}
      title={toPersonName(holder)}
      span={formatPeriod(holder.sinceOn, holder.untilOn)}
      tone="neutral"
    />
  ));

  return (
    <KkPanelSection title={ROLE_SECTION_TITLES.history}>
      <KkPanel variant="list">{rows}</KkPanel>
    </KkPanelSection>
  );
};
