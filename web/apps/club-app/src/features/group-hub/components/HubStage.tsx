import { toImageSource } from '@furria/ui/image-source';
import { KkChip } from '@furria/ui/KkChip';
import { KkGroupStage } from '@furria/ui/KkGroupStage';
import { KkPhoto } from '@furria/ui/KkPhoto';
import type { FC } from 'react';
import { toGroupTone } from '@/features/groups/group-identity';
import { toGroupKindLabel } from '@/features/groups/groups-labels';
import { currentSessionYear } from '@/lib/club';
import { useGroupHubQuery } from '../api';
import {
  toAnniversarySeal,
  toHubMetaFacts,
  toHubRecruitingChip,
  toStandingLine,
} from '../group-hub-labels';

const STAGE_SIZES = '(min-width: 900px) 70vw, 100vw';

interface HubStageProps {
  groupId: number | null;
}

export const HubStage: FC<HubStageProps> = ({ groupId }) => {
  const hub = useGroupHubQuery(groupId);
  const group = hub.data;

  if (group === undefined) {
    return groupId === null || hub.error !== null ? null : <KkGroupStage.Resting />;
  }

  const tone = toGroupTone(group.groupId, group.tone);
  const recruiting = toHubRecruitingChip(group);

  const chip =
    recruiting === null ? undefined : (
      <KkChip tone={recruiting.tone} dot={recruiting.dot}>
        {recruiting.label}
      </KkChip>
    );

  const standing = toStandingLine(group);
  const picture = toImageSource(group.picture, 'groupPicture', STAGE_SIZES);

  const media = picture === null ? undefined : <KkPhoto alt={group.name} image={picture} fill />;

  return (
    <KkGroupStage
      tone={tone}
      name={group.name}
      kindLabel={toGroupKindLabel(group.groupKindName)}
      anniversary={toAnniversarySeal(group.foundedYear, currentSessionYear())}
      media={media}
    >
      {standing === null ? null : (
        <KkGroupStage.Standing tone={tone}>{standing}</KkGroupStage.Standing>
      )}
      <KkGroupStage.Meta facts={toHubMetaFacts(group)} chip={chip} />
    </KkGroupStage>
  );
};
