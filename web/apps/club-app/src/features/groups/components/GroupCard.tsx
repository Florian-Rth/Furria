import type { KkSx } from '@furria/ui';
import { KkAvatarStack, KkChip, KkEyebrow, KkHeading, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toRecruitingChip } from '@/lib/state-chips';
import { toPersonUnitLabel, toRecruitingContactLine } from '../groups-labels';
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

  const unitLabel = toPersonUnitLabel(group.memberCount);

  const footer =
    avatars === null && contactLine === null ? null : (
      <Stack sx={{ gap: 1, minWidth: 0, pt: 1.75 }}>
        {avatars}
        {contactLine}
      </Stack>
    );

  return (
    <KkPanel variant="block" component={Link} to={GROUP_PATH} params={params} sx={sx}>
      <Stack sx={{ gap: 1.25, minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
          <Stack sx={{ gap: 0.875, minWidth: 0, flexGrow: 1, alignItems: 'flex-start' }}>
            <KkHeading level={5} component="h3" sx={{ minWidth: 0 }}>
              {group.name}
            </KkHeading>
            <KkChip tone={openness.tone} dot={openness.dot}>
              {openness.label}
            </KkChip>
          </Stack>
          <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
            <KkHeading level={4} tone="accent" component="p">
              {group.memberCount}
            </KkHeading>
            <KkEyebrow tone="muted" size="small">
              {unitLabel}
            </KkEyebrow>
          </Stack>
        </Stack>
        {descriptionLine}
      </Stack>
      {footer}
    </KkPanel>
  );
};
