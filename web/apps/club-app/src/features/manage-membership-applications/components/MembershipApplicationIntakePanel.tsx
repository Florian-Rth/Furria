import { KkFieldRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { formatInstantDay, INTAKE_SECTION_TITLE } from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';

const SUBMITTED_LABEL = 'Eingegangen';
const CONFIRMED_LABEL = 'Bestätigt';

interface MembershipApplicationIntakePanelProps {
  application: MembershipApplicationDetails;
}

export const MembershipApplicationIntakePanel: FC<MembershipApplicationIntakePanelProps> = ({
  application,
}) => {
  const submittedOn = formatInstantDay(application.submittedAt);
  const confirmedOn = formatInstantDay(application.confirmedAt);

  return (
    <KkPanelSection title={INTAKE_SECTION_TITLE}>
      <KkPanel>
        <KkFieldRow label={SUBMITTED_LABEL} value={submittedOn} />
        <KkFieldRow label={CONFIRMED_LABEL} value={confirmedOn} />
      </KkPanel>
    </KkPanelSection>
  );
};
