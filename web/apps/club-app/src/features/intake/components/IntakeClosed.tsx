import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { IntakeClosedReason } from '../intake-copy';
import { CLOSED_LINES, CLOSED_TITLES } from '../intake-copy';

interface IntakeClosedProps {
  reason: IntakeClosedReason;
}

export const IntakeClosed: FC<IntakeClosedProps> = ({ reason }) => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkHeading level={1} component="h1">
      {CLOSED_TITLES[reason]}
    </KkHeading>
    <KkNote>{CLOSED_LINES[reason]}</KkNote>
  </Stack>
);
