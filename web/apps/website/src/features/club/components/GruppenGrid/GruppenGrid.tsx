import { KkSection } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  GROUPS,
  groupsChapter,
  groupsIntro,
  resolveGroupTint,
} from '@/features/club/groups-content';
import { GruppenTileGrid } from './internal/layout/GruppenTileGrid';
import { useGroupModal } from './internal/logic/use-group-modal';
import { GruppenModal } from './internal/ui/GruppenModal';
import { GruppenTile } from './internal/ui/GruppenTile';

export const GruppenGrid: FC = () => {
  const theme = useTheme();
  const { activeGroup, openGroup, close } = useGroupModal(GROUPS);

  return (
    <KkSection>
      <KkSection.Header {...groupsChapter} />
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
      >
        {groupsIntro}
      </Typography>
      <GruppenTileGrid>
        {GROUPS.map((group, index) => (
          <GruppenTile
            key={group.title}
            group={group}
            tint={resolveGroupTint(theme, index)}
            badge={String(index + 1).padStart(2, '0')}
            onOpen={() => openGroup(group.title)}
          />
        ))}
      </GruppenTileGrid>
      <GruppenModal active={activeGroup} onClose={close} />
    </KkSection>
  );
};
