import type { KkSx } from '@furria/ui';
import { KkChip, KkMeta, useKkSheetCommands } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toRecruitingChip } from '@/lib/state-chips';
import type { GroupStanding } from '../groups-labels';
import { toGroupStandingChips, toPersonUnitLabel, toRecruitingContactLine } from '../groups-labels';
import type { GroupSummary } from '../schemas';
import { GroupCardBody } from './GroupCardBody';

interface GroupCardProps {
  group: GroupSummary;
  standing?: GroupStanding;
  sx?: KkSx;
}

export const GroupCard: FC<GroupCardProps> = ({ group, standing, sx }) => {
  const sheet = useKkSheetCommands();
  const peek = toPeekId('group', group.groupId);

  const openPeek = (): void => {
    sheet.open(peek);
  };

  const openness = toRecruitingChip(group.isRecruiting);
  const unitLabel = toPersonUnitLabel(group.memberCount);
  const standingChips = toGroupStandingChips(standing);
  const initials = group.memberPreview.map((person) =>
    toInitials(person.firstName, person.lastName),
  );

  const chips = (
    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', minWidth: 0 }}>
      <KkChip tone={openness.tone} dot={openness.dot} size="small">
        {openness.label}
      </KkChip>
      {standingChips.map((chip) => (
        <KkChip key={chip.label} tone={chip.tone} dot={chip.dot} size="small">
          {chip.label}
        </KkChip>
      ))}
    </Stack>
  );

  const contactLine = group.isRecruiting ? (
    <KkMeta>{toRecruitingContactLine(group.admins)}</KkMeta>
  ) : undefined;

  return (
    <GroupCardBody
      name={group.name}
      count={group.memberCount}
      unitLabel={unitLabel}
      description={group.description}
      initials={initials}
      total={group.memberCount}
      chips={chips}
      footer={contactLine}
      onSelect={openPeek}
      sx={sx}
    />
  );
};
