import { KkChip, KkGroupStage } from '@furria/ui';
import type { FC } from 'react';
import { toGroupKindLabel, toGroupTone } from '@/features/groups';
import { currentSessionYear } from '@/lib/club';
import { useGroupHubQuery } from '../api';
import {
  toHubMetaFacts,
  toHubRecruitingChip,
  toJubileeSeal,
  toStandingLine,
} from '../group-hub-labels';

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

  return (
    <KkGroupStage
      tone={tone}
      name={group.name}
      kindLabel={toGroupKindLabel(group.groupKindName)}
      jubilee={toJubileeSeal(group.foundedYear, currentSessionYear())}
    >
      {standing === null ? null : (
        <KkGroupStage.Standing tone={tone}>{standing}</KkGroupStage.Standing>
      )}
      <KkGroupStage.Meta facts={toHubMetaFacts(group)} chip={chip} />
    </KkGroupStage>
  );
};
