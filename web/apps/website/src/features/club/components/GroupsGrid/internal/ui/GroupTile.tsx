import type { KkGroupTone } from '@furria/ui';
import { KkCard, KkCoverPicture, KkPhotoPlaceholder } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  buildGroupOpenLabel,
  groupsLabels,
  resolveGroupOpenness,
} from '@/features/club/groups-content';
import { GROUP_PICTURE_ASPECT, toPictureSources } from '@/lib/api/picture';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import { GroupOpennessChip } from './GroupOpennessChip';

const DESCRIPTION_CLAMP = 3;
const TILE_SIZES = '(min-width: 900px) 25vw, (min-width: 600px) 50vw, 100vw';

interface GroupTileProps {
  group: PublicGroup;
  tint: string;
  tone: KkGroupTone | undefined;
  badge: string;
  onOpen: () => void;
}

export const GroupTile: FC<GroupTileProps> = ({ group, tint, tone, badge, onOpen }) => {
  const openness = resolveGroupOpenness(group.isRecruiting);
  const description = group.description.trim();
  const picture = toPictureSources(group.picture, GROUP_PICTURE_ASPECT);
  const media =
    picture.source === undefined ? (
      <KkPhotoPlaceholder label={groupsLabels.photo} tint={tint} tone={tone} fill />
    ) : (
      <KkCoverPicture
        source={picture.source}
        sourceSet={picture.sourceSet}
        sizes={TILE_SIZES}
        alt={group.name}
      />
    );
  const text =
    description === '' ? null : <KkCard.Text clamp={DESCRIPTION_CLAMP}>{description}</KkCard.Text>;

  return (
    <KkCard>
      <KkCard.Action onClick={onOpen} aria-label={buildGroupOpenLabel(group.name)}>
        <KkCard.Media>
          {media}
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
