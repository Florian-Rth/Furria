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
import { GruppenTileGrid } from '../layout/GruppenTileGrid';
import { useGroupModal } from '../logic/use-group-modal';
import { GruppenModal } from './GruppenModal';
import { GruppenTile } from './GruppenTile';

interface GruppenGalleryProps {
  groups: PublicGroup[];
}

interface GruppenTileModel {
  group: PublicGroup;
  tint: string;
  badge: string;
  open: () => void;
}

export const GruppenGallery: FC<GruppenGalleryProps> = ({ groups }) => {
  const theme = useTheme();
  const { activeGroup, openGroup, close } = useGroupModal(groups);

  const intro = buildGroupsIntro(groups.length, countRecruitingGroups(groups));

  const tiles = groups.map(
    (group, index): GruppenTileModel => ({
      group,
      tint: resolveGroupTint(theme, index),
      badge: buildGroupBadge(index),
      open: (): void => openGroup(group.groupId),
    }),
  );

  return (
    <>
      <KkLead>{intro}</KkLead>
      <GruppenTileGrid>
        {tiles.map((tile) => (
          <GruppenTile
            key={tile.group.groupId}
            group={tile.group}
            tint={tile.tint}
            badge={tile.badge}
            onOpen={tile.open}
          />
        ))}
      </GruppenTileGrid>
      <GruppenModal active={activeGroup} onClose={close} />
    </>
  );
};
