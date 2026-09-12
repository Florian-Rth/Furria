import { KkEmptyState, KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleHolder } from '../schemas';
import { RoleHolderRow } from './RoleHolderRow';

const SECTION_TITLE = 'Inhaber';
const SKELETON_ROWS = 2;
const EMPTY_TITLE = 'NIEMAND EINGETRAGEN';
const EMPTY_DESCRIPTION =
  'Die Rolle ist unbesetzt. Die Rechte sind gesetzt und greifen, sobald jemand eingetragen wird.';

interface RoleHoldersPanelProps {
  holders: readonly RoleHolder[];
  canOpenPerson: boolean;
  pending: boolean;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHoldersPanel: FC<RoleHoldersPanelProps> = ({
  holders,
  canOpenPerson,
  pending,
  onEnd,
}) => {
  if (pending) {
    return (
      <KkPanelSection title={SECTION_TITLE}>
        <KkPanel variant="list">
          <KkSkeletonRow count={SKELETON_ROWS} />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const rows = holders.map((holder) => (
    <RoleHolderRow
      key={holder.roleHoldingId}
      holder={holder}
      canOpenPerson={canOpenPerson}
      onEnd={onEnd}
    />
  ));

  const isEmpty = rows.length === 0;

  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
