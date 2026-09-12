import { KkChip, KkEyebrow, KkMeta, KkPageHeader } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_EYEBROW, toGroupHeadline } from '../groups-labels';
import type { GroupDetails } from '../schemas';

interface GroupHeaderProps {
  group: GroupDetails | undefined;
}

export const GroupHeader: FC<GroupHeaderProps> = ({ group }) => {
  const headline = toGroupHeadline(group);

  const opennessChip =
    headline.openness === null ? null : (
      <KkChip tone={headline.openness.tone} dot={headline.openness.dot}>
        {headline.openness.label}
      </KkChip>
    );

  const memberCountLine =
    headline.memberCount === null ? null : <KkMeta>{headline.memberCount}</KkMeta>;

  return (
    <KkPageHeader
      title={headline.title}
      titleTransform="none"
      eyebrow={
        <KkEyebrow tone="accent" size="small">
          {GROUP_EYEBROW}
        </KkEyebrow>
      }
      chip={opennessChip}
      subline={memberCountLine}
    />
  );
};
