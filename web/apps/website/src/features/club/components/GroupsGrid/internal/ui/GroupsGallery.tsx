import { KkLead } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import { GroupTileGrid } from '../layout/GroupTileGrid';
import { useGroupGallery } from '../logic/use-group-gallery';
import { GroupKindHeading } from './GroupKindHeading';
import { GroupModal } from './GroupModal';
import { GroupTile } from './GroupTile';

interface GroupsGalleryProps {
  groups: PublicGroup[];
}

export const GroupsGallery: FC<GroupsGalleryProps> = ({ groups }) => {
  const { intro, sections, activeGroup, close } = useGroupGallery(groups);

  return (
    <>
      <KkLead>{intro}</KkLead>
      {sections.map((section) => (
        <Stack key={section.key} sx={{ gap: 2 }}>
          <GroupKindHeading title={section.title} />
          <GroupTileGrid>
            {section.tiles.map((tile) => (
              <GroupTile
                key={tile.group.groupId}
                group={tile.group}
                tint={tile.tint}
                tone={tile.tone}
                badge={tile.badge}
                onOpen={tile.open}
              />
            ))}
          </GroupTileGrid>
        </Stack>
      ))}
      <GroupModal active={activeGroup} onClose={close} />
    </>
  );
};
