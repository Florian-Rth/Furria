import { KkHeading, KkNote, KkPanel, KkQrCode } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { formatCountdown } from '@/lib/countdown';
import {
  IN_PERSON_EXPIRED_LINE,
  IN_PERSON_INSTRUCTION,
  toInPersonCountdownLine,
  toInPersonQrLabel,
} from '../account-access-labels';
import type { InPersonInvitation } from '../schemas';
import type { InPersonPurpose } from '../types';

interface InPersonCodeCardProps {
  purpose: InPersonPurpose;
  invitation: InPersonInvitation;
  firstName: string;
  secondsLeft: number;
}

export const InPersonCodeCard: FC<InPersonCodeCardProps> = ({
  purpose,
  invitation,
  firstName,
  secondsLeft,
}) => {
  const isExpired = secondsLeft === 0;
  const validityLine = isExpired
    ? IN_PERSON_EXPIRED_LINE
    : toInPersonCountdownLine(formatCountdown(secondsLeft));
  const codeTone = isExpired ? 'default' : 'accent';
  const validityTone = isExpired ? 'warning' : 'muted';
  const qrLabel = toInPersonQrLabel(purpose, firstName);

  return (
    <KkPanel variant="block">
      <Stack sx={{ gap: 2, alignItems: 'center', minWidth: 0 }}>
        <KkQrCode value={invitation.link} label={qrLabel} dimmed={isExpired} />
        <KkHeading level={1} component="p" tone={codeTone}>
          {invitation.code}
        </KkHeading>
        <KkNote tone={validityTone}>{validityLine}</KkNote>
        <KkNote tone="hint" icon="info">
          {IN_PERSON_INSTRUCTION}
        </KkNote>
      </Stack>
    </KkPanel>
  );
};
