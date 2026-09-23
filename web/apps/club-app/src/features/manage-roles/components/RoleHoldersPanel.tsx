import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ROLE_SECTION_TITLES } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';
import { RoleHolderRow } from './RoleHolderRow';

const ADD_TEXT = 'Inhaberschaft';
const ADD_ACTION_LABEL = 'Inhaberschaft eintragen';
const HOLDINGS_NEW_ROUTE = '/manage/roles/$roleId/holdings/new';
const SKELETON_ROWS = 2;
const EMPTY_TITLE = 'NIEMAND EINGETRAGEN';
const EMPTY_DESCRIPTION =
  'Die Rolle ist unbesetzt. Ihre Rechte gelten, sobald jemand eingetragen ist.';

interface RoleHoldersPanelProps {
  roleId: number;
  holders: readonly RoleHolder[];
  canAdd: boolean;
  pending: boolean;
  highlightedKey: string | null;
}

export const RoleHoldersPanel: FC<RoleHoldersPanelProps> = ({
  roleId,
  holders,
  canAdd,
  pending,
  highlightedKey,
}) => {
  const action: KkPanelAction | undefined = canAdd
    ? {
        label: ADD_TEXT,
        icon: 'add',
        ariaLabel: ADD_ACTION_LABEL,
        component: Link,
        to: HOLDINGS_NEW_ROUTE,
        params: { roleId: String(roleId) },
      }
    : undefined;

  if (pending) {
    return (
      <KkPanelSection title={ROLE_SECTION_TITLES.holders} action={action}>
        <KkPanel variant="list">
          <KkSkeletonRow count={SKELETON_ROWS} />
        </KkPanel>
      </KkPanelSection>
    );
  }

  const rows = holders.map((holder) => (
    <RoleHolderRow
      key={holder.roleHoldingId}
      roleId={roleId}
      holder={holder}
      highlightedKey={highlightedKey}
    />
  ));

  const isEmpty = rows.length === 0;

  const body = isEmpty ? (
    <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={ROLE_SECTION_TITLES.holders} action={action}>
      <KkPanel variant={isEmpty ? 'block' : 'list'}>{body}</KkPanel>
    </KkPanelSection>
  );
};
