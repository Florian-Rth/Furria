import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleHolder } from '../schemas';
import { RoleHolderRow } from './RoleHolderRow';

const SECTION_TITLE = 'Inhaber';
const ADD_HOLDER_LABEL = 'Inhaber eintragen';
const ADD_TEXT = 'Inhaber';
const SKELETON_ROWS = 2;
const EMPTY_TITLE = 'NIEMAND EINGETRAGEN';
const EMPTY_DESCRIPTION =
  'Die Rolle ist unbesetzt. Die Rechte sind gesetzt und greifen, sobald jemand eingetragen wird.';

interface RoleHoldersPanelProps {
  holders: readonly RoleHolder[];
  canOpenPerson: boolean;
  canAdd: boolean;
  pending: boolean;
  onAdd: () => void;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHoldersPanel: FC<RoleHoldersPanelProps> = ({
  holders,
  canOpenPerson,
  canAdd,
  pending,
  onAdd,
  onEnd,
}) => {
  const action = canAdd ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={ADD_HOLDER_LABEL}
      onClick={onAdd}
    >
      {ADD_TEXT}
    </KkButton>
  ) : null;

  if (pending) {
    return (
      <KkPanelSection title={SECTION_TITLE} action={action}>
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
    <KkPanelSection title={SECTION_TITLE} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
