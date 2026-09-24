import { KkLead } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  buildGroupBadge,
  buildGroupsIntro,
  countRecruitingGroups,
  resolveGroupTint,
} from '@/features/club/groups-content';
import type { PublicGroup } from '@/features/club/schemas';
import { GroupTileGrid } from '../layout/GroupTileGrid';
import { useGroupModal } from '../logic/use-group-modal';
import { GroupModal } from './GroupModal';
import { GroupTile } from './GroupTile';

interface GroupsGalleryProps {
  groups: PublicGroup[];
}

interface GroupTileModel {
  group: PublicGroup;
  tint: string;
  badge: string;
  open: () => void;
}

export const GroupsGallery: FC<GroupsGalleryProps> = ({ groups }) => {
  const theme = useTheme();
  const { activeGroup, openGroup, close } = useGroupModal(groups);

  const intro = buildGroupsIntro(groups.length, countRecruitingGroups(groups));

  const tiles = groups.map(
    (group, index): GroupTileModel => ({
      group,
      tint: resolveGroupTint(theme, index),
      badge: buildGroupBadge(index),
      open: (): void => openGroup(group.groupId),
    }),
  );

  return (
    <>
      <KkLead>{intro}</KkLead>
      <GroupTileGrid>
        {tiles.map((tile) => (
          <GroupTile
            key={tile.group.groupId}
            group={tile.group}
            tint={tile.tint}
            badge={tile.badge}
            onOpen={tile.open}
          />
        ))}
      </GroupTileGrid>
      <GroupModal active={activeGroup} onClose={close} />
    </>
  );
};
