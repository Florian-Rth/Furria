import { KkEmptyState, KkPanel, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleHolder } from '../schemas';
import { RoleHolderRow } from './RoleHolderRow';
import { RoleSection } from './RoleSection';

const SECTION_TITLE = 'Wer hat sie inne';
const SKELETON_ROWS = 2;
const EMPTY_TITLE = 'NIEMAND EINGETRAGEN';
const EMPTY_DESCRIPTION =
  'Die Rolle ist unbesetzt. Die Rechte sind gesetzt und greifen, sobald jemand eingetragen wird.';

interface RoleHoldersPanelProps {
  holders: readonly RoleHolder[];
  pending: boolean;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHoldersPanel: FC<RoleHoldersPanelProps> = ({ holders, pending, onEnd }) => {
  if (pending) {
    return (
      <RoleSection title={SECTION_TITLE}>
        <KkPanel variant="list">
          <KkSkeletonRow count={SKELETON_ROWS} />
        </KkPanel>
      </RoleSection>
    );
  }

  const rows = holders.map((holder) => (
    <RoleHolderRow key={holder.roleHoldingId} holder={holder} onEnd={onEnd} />
  ));

  const isEmpty = rows.length === 0;

  const body = isEmpty ? (
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <RoleSection title={SECTION_TITLE}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </RoleSection>
  );
};
