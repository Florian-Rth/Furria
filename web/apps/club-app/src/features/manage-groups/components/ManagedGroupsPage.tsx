import type { KkScreenAction } from '@furria/ui';
import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import {
  MANAGE_ORIGIN,
  RequirePermission,
  usePermissions,
  useScreenSearch,
} from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import { useGroupCreateDialog } from '../hooks/use-group-create-dialog';
import { useManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { toManagedGroupsLead } from '../manage-groups-work';
import type { ManagedGroupSummary } from '../schemas';
import { GroupFormDialog } from './GroupFormDialog';
import { ManagedGroupsBody } from './ManagedGroupsBody';
import { ManagedGroupsToolbar } from './ManagedGroupsToolbar';

const MANAGE_GROUPS_TITLE = 'Gruppenverwaltung';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

const CREATE_LABEL = 'Gruppe anlegen';

const TOOLBAR_CHIPS = 2;

const MIN_OFFERED_FILTERS = 2;

const NO_GROUPS: readonly ManagedGroupSummary[] = [];

export const ManagedGroupsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useManagedGroupsQuery();
  const rows = groups.data?.groups ?? NO_GROUPS;
  const listing = useManagedGroupsListing(rows);
  const create = useGroupCreateDialog();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.groupsManage);
  const lead = groups.data === undefined ? undefined : toManagedGroupsLead(listing.facets);

  const onCreated = (): void => {
    create.close();
  };

  const createAction: KkScreenAction = {
    id: 'create-group',
    label: CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: create.open,
  };

  const actions: readonly [KkScreenAction] | undefined = canManage ? [createAction] : undefined;

  const filterStrip =
    listing.filterOptions.length < MIN_OFFERED_FILTERS ? undefined : (
      <ManagedGroupsToolbar
        filter={listing.filter}
        options={listing.filterOptions}
        onFilterChange={listing.selectFilter}
      />
    );

  const toolRow =
    groups.data === undefined ? <KkSkeletonToolbar chips={TOOLBAR_CHIPS} /> : filterStrip;

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      actions={actions}
      tools={canManage ? toolRow : undefined}
      title={MANAGE_GROUPS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_GROUPS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
        <ManagedGroupsBody listing={listing} />
        <GroupFormDialog
          group={null}
          open={create.isOpen}
          onClose={create.close}
          onSaved={onCreated}
        />
      </RequirePermission>
    </KkScreen>
  );
};
