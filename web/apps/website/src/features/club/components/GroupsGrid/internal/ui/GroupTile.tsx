import type { KkGroupTone } from '@furria/ui/group-tone';
import { toImageSource } from '@furria/ui/image-source';
import { KkCard } from '@furria/ui/KkCard';
import { KkPhoto } from '@furria/ui/KkPhoto';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  buildGroupOpenLabel,
  groupsLabels,
  resolveGroupOpenness,
} from '@/features/club/groups-content';
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
  const picture = toImageSource(group.picture, 'groupPicture', TILE_SIZES);
  const media = (
    <KkPhoto
      alt={group.name}
      image={picture}
      placeholderLabel={groupsLabels.photo}
      tint={tint}
      tone={tone}
      fill
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
