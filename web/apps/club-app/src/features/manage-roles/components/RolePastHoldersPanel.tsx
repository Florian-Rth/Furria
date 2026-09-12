import { KkFactRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { formatPeriod } from '@/lib/membership-labels';
import { toPersonName } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const SECTION_TITLE = 'Geschichte';

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
    <KkPanelSection title={SECTION_TITLE}>
      <KkPanel variant="list">{rows}</KkPanel>
    </KkPanelSection>
  );
};
