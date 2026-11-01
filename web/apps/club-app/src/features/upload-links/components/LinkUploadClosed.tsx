import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CLOSED_LINES, CLOSED_TITLES } from '../upload-link-copy';

export type LinkUploadClosedReason = keyof typeof CLOSED_TITLES;

interface LinkUploadClosedProps {
  reason: LinkUploadClosedReason;
}

export const LinkUploadClosed: FC<LinkUploadClosedProps> = ({ reason }) => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkHeading level={1} component="h1">
      {CLOSED_TITLES[reason]}
    </KkHeading>
    <KkNote>{CLOSED_LINES[reason]}</KkNote>
  </Stack>
);
