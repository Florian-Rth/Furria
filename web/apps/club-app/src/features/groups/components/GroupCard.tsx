import type { KkSx } from '@furria/ui';
import { KkAvatarStack, KkChip, KkHeading, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toRecruitingChip } from '@/lib/state-chips';
import { toMemberCountLabel, toRecruitingContactLine } from '../groups-labels';
import type { GroupSummary } from '../schemas';

const GROUP_PATH = '/groups/$groupId';
const PREVIEW_MAX = 5;

interface GroupCardProps {
  group: GroupSummary;
  sx?: KkSx;
}

export const GroupCard: FC<GroupCardProps> = ({ group, sx }) => {
  const params = { groupId: String(group.groupId) };
  const openness = toRecruitingChip(group.isRecruiting);
  const countLabel = toMemberCountLabel(group.memberCount);
  const isDeserted = group.memberCount === 0;
  const description = group.description.trim();
  const initials = group.memberPreview.map((person) =>
    toInitials(person.firstName, person.lastName),
  );

  const descriptionLine =
    description === '' ? null : (
      <KkText variant="body2" tone="secondary">
        {description}
      </KkText>
    );

  const avatars =
    initials.length === 0 ? null : <KkAvatarStack initials={initials} max={PREVIEW_MAX} />;

  const contactLine = group.isRecruiting ? (
    <KkMeta>{toRecruitingContactLine(group.admins)}</KkMeta>
  ) : null;

  return (
    <KkPanel variant="block" component={Link} to={GROUP_PATH} params={params} sx={sx}>
      <Stack sx={{ gap: 1, minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1.5, minWidth: 0 }}>
          <KkHeading level={5} component="h3" sx={{ flexGrow: 1, minWidth: 0 }}>
            {group.name}
          </KkHeading>
          <KkHeading level={4} tone="accent" component="p" sx={{ flexShrink: 0 }}>
            {group.memberCount}
          </KkHeading>
        </Stack>
        {descriptionLine}
      </Stack>
      <Stack sx={{ gap: 1, minWidth: 0, pt: 1.75 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
        >
          {avatars}
          <KkMeta italic={isDeserted} sx={{ flexGrow: 1 }}>
            {countLabel}
          </KkMeta>
          <KkChip tone={openness.tone} dot={openness.dot}>
            {openness.label}
          </KkChip>
        </Stack>
        {contactLine}
      </Stack>
    </KkPanel>
  );
};
