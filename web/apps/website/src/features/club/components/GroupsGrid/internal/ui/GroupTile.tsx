import { KkCard, KkPhotoPlaceholder } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  buildGroupOpenLabel,
  groupsLabels,
  resolveGroupOpenness,
} from '@/features/club/groups-content';
import type { PublicGroup } from '@/features/club/schemas';
import { GroupOpennessChip } from './GroupOpennessChip';

const DESCRIPTION_CLAMP = 3;

interface GroupTileProps {
  group: PublicGroup;
  tint: string;
  badge: string;
  onOpen: () => void;
}

export const GroupTile: FC<GroupTileProps> = ({ group, tint, badge, onOpen }) => {
  const openness = resolveGroupOpenness(group.isRecruiting);
  const description = group.description.trim();
  const text =
    description === '' ? null : <KkCard.Text clamp={DESCRIPTION_CLAMP}>{description}</KkCard.Text>;

  return (
    <KkCard>
      <KkCard.Action onClick={onOpen} aria-label={buildGroupOpenLabel(group.name)}>
        <KkCard.Media>
          <KkPhotoPlaceholder label={groupsLabels.photo} tint={tint} fill />
          <KkCard.Badge>{badge}</KkCard.Badge>
        </KkCard.Media>
        <KkCard.Body>
          <KkCard.Title>{group.name}</KkCard.Title>
          <KkCard.Meta>
            <GroupOpennessChip openness={openness} />
          </KkCard.Meta>
          {text}
          <KkCard.Footer>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, letterSpacing: '0.04em', color: 'primary.main' }}
            >
              {groupsLabels.more}
            </Typography>
          </KkCard.Footer>
        </KkCard.Body>
      </KkCard.Action>
    </KkCard>
  );
};
