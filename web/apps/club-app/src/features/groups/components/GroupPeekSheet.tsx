import {
  KkAvatarStack,
  KkButton,
  KkChip,
  KkMeta,
  KkPanelSection,
  KkSheet,
  KkText,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toRecruitingChip } from '@/lib/state-chips';
import { usePeek } from '@/lib/use-peek';
import {
  GROUP_PEEK_CLOSE_LABEL,
  GROUP_PEEK_OPEN_LABEL,
  toGroupSizeLine,
  toGroupStandingChips,
  toRecruitingContactLine,
} from '../groups-labels';
import { useGroupStanding } from '../hooks/use-group-standings';
import type { GroupSummary } from '../schemas';

const GROUP_PATH = '/groups/$groupId';
const DESCRIPTION_LINES = 4;
const CHIP_GAP = 0.75;
const MEMBERS_GAP = 1.25;

const toGroupId = (group: GroupSummary): number => group.groupId;

interface GroupPeekSheetProps {
  groups: readonly GroupSummary[];
}

export const GroupPeekSheet: FC<GroupPeekSheetProps> = ({ groups }) => {
  const group = usePeek('group', groups, toGroupId);
  const standing = useGroupStanding(group?.groupId);

  if (group === null) {
    return null;
  }

  const openness = toRecruitingChip(group.isRecruiting);
  const standingChips = toGroupStandingChips(standing);
  const params = { groupId: String(group.groupId) };
  const initials = group.memberPreview.map((person) =>
    toInitials(person.firstName, person.lastName),
  );

  return (
    <KkSheet
      id={toPeekId('group', group.groupId)}
      title={group.name}
      closeLabel={GROUP_PEEK_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <Stack direction="row" sx={{ gap: CHIP_GAP, flexWrap: 'wrap', minWidth: 0 }}>
          <KkChip tone={openness.tone} dot={openness.dot}>
            {openness.label}
          </KkChip>
          {standingChips.map((chip) => (
            <KkChip key={chip.label} tone={chip.tone} dot={chip.dot}>
              {chip.label}
            </KkChip>
          ))}
        </Stack>
        <KkPanelSection title={GROUP_SECTION_TITLES.about}>
          <KkText variant="body2" tone="secondary" clamp={DESCRIPTION_LINES}>
            {group.description}
          </KkText>
        </KkPanelSection>
        <KkPanelSection title={GROUP_SECTION_TITLES.members}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: MEMBERS_GAP, minWidth: 0 }}>
            <KkAvatarStack initials={initials} total={group.memberCount} />
            <KkMeta>{toGroupSizeLine(group.memberCount)}</KkMeta>
          </Stack>
        </KkPanelSection>
        <KkPanelSection title={GROUP_SECTION_TITLES.admins}>
          <KkMeta>{toRecruitingContactLine(group.admins)}</KkMeta>
        </KkPanelSection>
      </KkSheet.Body>
      <KkSheet.Actions>
        <KkButton component={Link} to={GROUP_PATH} params={params} fullWidth>
          {GROUP_PEEK_OPEN_LABEL}
        </KkButton>
      </KkSheet.Actions>
    </KkSheet>
  );
};
