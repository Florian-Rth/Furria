import { KkChip, KkEyebrow, KkMeta, KkPageHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
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
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
        {opennessChip}
        {standingChips}
      </Stack>
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
      chip={chipRow}
      subline={memberCountLine}
    />
  );
};
