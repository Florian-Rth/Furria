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
import { useManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import { MANAGE_GROUPS_TITLE } from '../manage-groups-labels';
import { toManagedGroupsLead } from '../manage-groups-work';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupsBody } from './ManagedGroupsBody';
import { ManagedGroupsToolbar } from './ManagedGroupsToolbar';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

const TOOLBAR_CHIPS = 2;

const MIN_OFFERED_FILTERS = 2;

const NO_GROUPS: readonly ManagedGroupSummary[] = [];

export const ManagedGroupsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useManagedGroupsQuery();
  const rows = groups.data?.groups ?? NO_GROUPS;
  const listing = useManagedGroupsListing(rows);
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.groupsManage);
  const lead = groups.data === undefined ? undefined : toManagedGroupsLead(listing.facets);

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
      tools={canManage ? toolRow : undefined}
      title={MANAGE_GROUPS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_GROUPS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
        <ManagedGroupsBody listing={listing} />
      </RequirePermission>
    </KkScreen>
  );
};
