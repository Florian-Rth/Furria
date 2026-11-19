import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DONE_LINE, DONE_TITLE, SET_UP_APP_LABEL } from '../intake-copy';
import { invitationHrefOf } from '../intake-page';
import type { IntakeSubmitted } from '../schemas';

interface IntakeDoneProps {
  submitted: IntakeSubmitted;
}

export const IntakeDone: FC<IntakeDoneProps> = ({ submitted }) => {
  const invitationHref = invitationHrefOf(submitted.invitationLink);
  const setUp =
    invitationHref === null ? null : (
      <KkButton fullWidth href={invitationHref}>
        {SET_UP_APP_LABEL}
      </KkButton>
    );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {DONE_TITLE}
        </KkHeading>
        <KkNote>{DONE_LINE}</KkNote>
      </Stack>
      {setUp}
    </Stack>
  );
};
