import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { useMyGroupsQuery } from '@/features/group-hub';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { ProfileGroupRow } from './ProfileGroupRow';
import { ProfilePanel } from './ProfilePanel';

const EMPTY_TITLE = 'IN KEINER GRUPPE';
const EMPTY_DESCRIPTION =
  'Du bist gerade in keiner Gruppe dabei. Unter „Gruppen“ steht, wer gerade Verstärkung sucht.';

export const ProfileGroupsPanel: FC = () => {
  const myGroups = useMyGroupsQuery();
  const groups = myGroups.data?.groups;

  if (groups === undefined) {
    return null;
  }

  const body =
    groups.length === 0 ? (
      <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    ) : (
      groups.map((group) => <ProfileGroupRow key={group.groupId} group={group} />)
    );

  return <ProfilePanel title={PROFILE_SECTION_TITLES.groups}>{body}</ProfilePanel>;
};
