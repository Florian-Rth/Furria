import { KkEmptyState, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  APPLICATIONS_EMPTY,
  APPLICATIONS_FOOTNOTE,
  APPLICATIONS_SECTION_TITLE,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationSummary } from '../schemas';
import { MembershipApplicationRow } from './MembershipApplicationRow';

const VIEW_GAP = 3;

interface MembershipApplicationsViewProps {
  applications: readonly MembershipApplicationSummary[];
}

export const MembershipApplicationsView: FC<MembershipApplicationsViewProps> = ({
  applications,
}) => {
  const now = new Date();
  const isEmpty = applications.length === 0;
  const panelVariant = isEmpty ? 'block' : 'list';
  const rows = applications.map((application) => (
    <MembershipApplicationRow
      key={application.membershipApplicationId}
      application={application}
      now={now}
    />
  ));
  const body = isEmpty ? (
    <KkEmptyState
      size="panel"
      title={APPLICATIONS_EMPTY.title}
      description={APPLICATIONS_EMPTY.description}
    />
  ) : (
    rows
  );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <KkPanelSection title={APPLICATIONS_SECTION_TITLE}>
        <KkPanel variant={panelVariant}>{body}</KkPanel>
      </KkPanelSection>
      <KkNote>{APPLICATIONS_FOOTNOTE}</KkNote>
    </Stack>
  );
};
