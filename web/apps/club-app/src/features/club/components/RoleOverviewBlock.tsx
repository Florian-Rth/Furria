import { KkMeta, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { RoleOverview } from '@/features/roles-overview';
import { RoleHolderRow } from './RoleHolderRow';

const NO_HOLDER_LINE = 'Diese Rolle hat gerade niemand.';

interface RoleOverviewBlockProps {
  role: RoleOverview;
}

export const RoleOverviewBlock: FC<RoleOverviewBlockProps> = ({ role }) => {
  const description = role.description.trim() === '' ? undefined : role.description;

  const rows = role.holders.map((holder) => (
    <RoleHolderRow key={holder.personId} holder={holder} />
  ));

  const body =
    rows.length === 0 ? <KkMeta italic>{NO_HOLDER_LINE}</KkMeta> : <KkPanel>{rows}</KkPanel>;

  return (
    <KkPanelSection title={role.name} description={description}>
      {body}
    </KkPanelSection>
  );
};
