import type { FC } from 'react';
import { GroupDetailLayout, GroupEventsSlot, GroupPhotosSlot } from '@/features/group-detail';
import { usePermissions } from '@/features/session';
import type { GroupDetails } from '../schemas';
import { GroupAdminsPanel } from './GroupAdminsPanel';
import { GroupDescription } from './GroupDescription';
import { GroupMembersPanel } from './GroupMembersPanel';

interface GroupViewProps {
  group: GroupDetails;
}

export const GroupView: FC<GroupViewProps> = ({ group }) => {
  const { isAffiliated } = usePermissions();

  return (
    <GroupDetailLayout
      about={
        <GroupDescription
          groupId={group.groupId}
          groupName={group.name}
          description={group.description}
        />
      }
      admins={
        <GroupAdminsPanel
          admins={group.admins}
          isRecruiting={group.isRecruiting}
          viewerIsAffiliated={isAffiliated}
        />
      }
      members={
        <GroupMembersPanel
          members={group.members}
          groupName={group.name}
          viewerIsAffiliated={isAffiliated}
        />
      }
      events={<GroupEventsSlot />}
      photos={<GroupPhotosSlot />}
    />
  );
};
