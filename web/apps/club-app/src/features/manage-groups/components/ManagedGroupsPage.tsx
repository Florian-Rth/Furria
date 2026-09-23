import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import {
  AREA_HANDOVERS,
  MANAGE_ORIGIN,
  RequirePermission,
  usePermissions,
  useScreenSearch,
} from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import { useManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { MANAGE_GROUPS_TITLE } from '../manage-groups-labels';
import { MANAGE_GROUPS_LEAD } from '../manage-groups-work';
import { ManagedGroupsBody } from './ManagedGroupsBody';
import { ManagedGroupsToolbar } from './ManagedGroupsToolbar';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

const TOOLBAR_CHIPS = 2;

const MIN_OFFERED_FILTERS = 2;

export const ManagedGroupsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useManagedGroupsQuery();
  const listing = useManagedGroupsListing(groups.data?.groups);
  const permissions = usePermissions();
  const canManage = permissions.isUndecided || permissions.has(PERMISSION_KEYS.groupsManage);
  const isLoading = canManage && groups.isPending;

  const offersFilters =
    groups.data !== undefined && listing.filterOptions.length >= MIN_OFFERED_FILTERS;

  const filterStrip = offersFilters ? (
    <ManagedGroupsToolbar
      filter={listing.filter}
      options={listing.filterOptions}
      onFilterChange={listing.selectFilter}
    />
  ) : undefined;

  const toolRow = isLoading ? <KkSkeletonToolbar chips={TOOLBAR_CHIPS} /> : filterStrip;

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={canManage ? toolRow : undefined}
      title={MANAGE_GROUPS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_GROUPS_TITLE} lead={MANAGE_GROUPS_LEAD} />}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
        <ManagedGroupsBody listing={listing} />
      </RequirePermission>
    </KkScreen>
  );
};
