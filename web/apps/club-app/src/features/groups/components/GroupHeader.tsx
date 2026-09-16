import { KkChip, KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_EYEBROW, toGroupHeadline, toGroupStandingChips } from '../groups-labels';
import { useGroupStanding } from '../hooks/use-group-standings';
import type { GroupDetails } from '../schemas';

interface GroupHeaderProps {
  group: GroupDetails | undefined;
}

export const GroupHeader: FC<GroupHeaderProps> = ({ group }) => {
  const headline = toGroupHeadline(group);
  const standing = useGroupStanding(group?.groupId);
  const chips = toGroupStandingChips(standing);

  const opennessChip =
    headline.openness === null ? null : (
      <KkChip tone={headline.openness.tone} dot={headline.openness.dot}>
        {headline.openness.label}
      </KkChip>
    );

  const standingChips = chips.map((chip) => (
    <KkChip key={chip.label} tone={chip.tone} dot={chip.dot}>
      {chip.label}
    </KkChip>
  ));

  const chipRow =
    opennessChip === null && standingChips.length === 0 ? null : (
      <KkScreenHeader.Meta>
        {opennessChip}
        {standingChips}
      </KkScreenHeader.Meta>
    );

  const memberCountLine =
    headline.memberCount === null ? null : <KkMeta>{headline.memberCount}</KkMeta>;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent" size="small">
          {GROUP_EYEBROW}
        </KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {chipRow}
        {memberCountLine}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
