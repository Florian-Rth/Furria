import { KkChip, KkCoverPicture, KkGroupStage } from '@furria/ui';
import type { FC } from 'react';
import { toGroupKindLabel, toGroupTone } from '@/features/groups';
import { currentSessionYear } from '@/lib/club';
import { GROUP_PICTURE_ASPECT, toPictureSources } from '@/lib/pictures';
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
  const picture = toPictureSources(group.picture, GROUP_PICTURE_ASPECT);

  const media =
    picture.source === undefined ? undefined : (
      <KkCoverPicture
        source={picture.source}
        sourceSet={picture.sourceSet}
        sizes={STAGE_SIZES}
        alt={group.name}
      />
    );

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
