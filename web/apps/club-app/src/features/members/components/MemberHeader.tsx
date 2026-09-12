import { KkAppShell, KkAvatar, KkChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toMemberHeadline } from '../members-labels';
import type { MemberDetails } from '../schemas';

interface MemberHeaderProps {
  member: MemberDetails | undefined;
}

export const MemberHeader: FC<MemberHeaderProps> = ({ member }) => {
  const headline = toMemberHeadline(member);

  const stateChip =
    headline.state === null ? null : (
      <KkChip tone={headline.state.tone} dot={headline.state.dot}>
        {headline.state.label}
      </KkChip>
    );

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: { xs: 1.75, desktop: 2.5 }, minWidth: 0 }}
    >
      <KkAvatar initials={headline.initials} size="large" />
      <Stack sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
        >
          <KkAppShell.PageTitle>{headline.title}</KkAppShell.PageTitle>
          {stateChip}
        </Stack>
      </Stack>
    </Stack>
  );
};
