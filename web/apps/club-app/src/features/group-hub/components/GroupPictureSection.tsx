import { KkPhoto } from '@furria/ui';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { PictureSection, usePictureSection } from '@/features/pictures';
import { useGroupHubQuery } from '../api';
import type { GroupHub } from '../schemas';

interface GroupPictureSectionProps {
  hub: GroupHub;
  tone: GroupTone;
}

export const GroupPictureSection: FC<GroupPictureSectionProps> = ({ hub, tone }) => {
  const query = useGroupHubQuery(hub.groupId);
  const desk = usePictureSection({
    target: { kind: 'groupPicture', ownerId: hub.groupId },
    editing: hub.pictureEditing,
    refresh: query.refetch,
  });
  const poster = <KkPhoto alt="" placeholderLabel={hub.name} tone={tone} fill />;

  return <PictureSection desk={desk} poster={poster} alt={hub.name} />;
};
