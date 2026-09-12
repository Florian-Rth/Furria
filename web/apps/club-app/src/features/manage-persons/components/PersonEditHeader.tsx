import { KkAppShell, KkAvatar, KkChip, KkEyebrow, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PERSONS_TITLE, toPersonHeadline } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

interface PersonEditHeaderProps {
  person: PersonDetails | undefined;
}

export const PersonEditHeader: FC<PersonEditHeaderProps> = ({ person }) => {
  const headline = toPersonHeadline(person);

  const stateChip =
    headline.state === null ? null : (
      <KkChip tone={headline.state.tone} dot={headline.state.dot}>
        {headline.state.label}
      </KkChip>
    );

  const membershipLine = headline.line === null ? null : <KkMeta>{headline.line}</KkMeta>;

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: { xs: 1.75, desktop: 2.5 }, minWidth: 0 }}
    >
      <KkAvatar initials={headline.initials} size="large" />
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <KkEyebrow size="small">{PERSONS_TITLE}</KkEyebrow>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
        >
          <KkAppShell.PageTitle>{headline.title}</KkAppShell.PageTitle>
          {stateChip}
        </Stack>
        {membershipLine}
      </Stack>
    </Stack>
  );
};
