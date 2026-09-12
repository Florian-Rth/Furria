import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { useMyGroupsQuery } from '@/features/group-hub';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { ProfileGroupRow } from './ProfileGroupRow';
import { ProfilePanel } from './ProfilePanel';

const NO_GROUPS_LINE = 'Du bist gerade in keiner Gruppe dabei.';

export const ProfileGroupsPanel: FC = () => {
  const myGroups = useMyGroupsQuery();
  const groups = myGroups.data?.groups;

  if (groups === undefined) {
    return null;
  }

  const body =
    groups.length === 0 ? (
      <KkMeta italic>{NO_GROUPS_LINE}</KkMeta>
    ) : (
      groups.map((group) => <ProfileGroupRow key={group.groupId} group={group} />)
    );

  return <ProfilePanel title={PROFILE_SECTION_TITLES.groups}>{body}</ProfilePanel>;
};
