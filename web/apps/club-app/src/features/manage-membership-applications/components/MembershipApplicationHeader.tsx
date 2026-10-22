import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkChip } from '@furria/ui/KkChip';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import {
  APPLICATION_EYEBROW,
  MINOR_CHIP,
  toApplicantName,
  toOpenSinceLine,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';

interface MembershipApplicationHeaderProps {
  application: MembershipApplicationDetails;
}

export const MembershipApplicationHeader: FC<MembershipApplicationHeaderProps> = ({
  application,
}) => {
  const initials = toInitials(application.firstName, application.lastName);
  const name = toApplicantName(application);
  const openSince = toOpenSinceLine(application.confirmedAt, new Date());
  const minorChip = application.isMinor ? (
    <KkChip tone={MINOR_CHIP.tone} dot={MINOR_CHIP.dot}>
      {MINOR_CHIP.label}
    </KkChip>
  ) : null;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={initials} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{APPLICATION_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{name}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          {minorChip}
          <KkMeta>{openSince}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
