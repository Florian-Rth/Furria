import type { KkPanelAction } from '@furria/ui';
import { KkChip, KkFieldRow, KkHubRow, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { accessActionsOf } from '../access-actions';
import {
  ACCESS_SECTION_TITLE,
  ACCESS_STATE_LABEL,
  IN_PERSON_ACT_LABEL,
  IN_PERSON_ROW_META,
  INVITATION_LABEL,
  MAIL_ACT_LABELS,
  MAIL_PILL_LABELS,
  toAccessBlockLine,
  toAccessLandingKey,
  toAccountStateChip,
  toInPersonHref,
  toInvitationSpan,
  toInvitationValidity,
} from '../account-access-labels';
import type { AccessSubject } from '../types';
import { AccessHistory } from './AccessHistory';

const INVITE_ROUTE = '/manage/persons/$personId/invitations/new';

interface AccessPanelProps {
  subject: AccessSubject;
  highlightedKey: string | null;
}

export const AccessPanel: FC<AccessPanelProps> = ({ subject, highlightedKey }) => {
  const { access } = subject;
  const { mailInvitation, inPersonInvitation } = accessActionsOf(access, subject.email);
  const chip = toAccountStateChip(access.state);
  const landingKey = toAccessLandingKey(subject.personId);

  const action: KkPanelAction | undefined =
    mailInvitation === null
      ? undefined
      : {
          label: MAIL_PILL_LABELS[mailInvitation],
          icon: 'mail',
          ariaLabel: MAIL_ACT_LABELS[mailInvitation],
          component: Link,
          to: INVITE_ROUTE,
          params: { personId: String(subject.personId) },
        };

  const stateChip = (
    <KkChip tone={chip.tone} dot={chip.dot}>
      {chip.label}
    </KkChip>
  );

  const invitationRow =
    access.invitation === null ? null : (
      <KkFieldRow
        label={INVITATION_LABEL}
        value={toInvitationSpan(access.invitation)}
        hint={toInvitationValidity(access.invitation)}
      />
    );

  const inPersonHref = toInPersonHref(subject.personId);
  const inPersonRow = inPersonInvitation ? (
    <KkPanel>
      <KkHubRow
        label={IN_PERSON_ACT_LABEL}
        icon="qr"
        meta={IN_PERSON_ROW_META}
        component={Link}
        to={inPersonHref}
      />
    </KkPanel>
  ) : null;

  const blockLine =
    access.reason === null ? null : (
      <KkNote tone="hint" icon="info">
        {toAccessBlockLine(access.reason, subject.firstName)}
      </KkNote>
    );

  return (
    <KkPanelSection title={ACCESS_SECTION_TITLE} action={action}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
          <KkFieldRow label={ACCESS_STATE_LABEL} value={stateChip} />
          {invitationRow}
        </KkPanel>
        {inPersonRow}
        {blockLine}
        <AccessHistory history={access.history} />
      </Stack>
    </KkPanelSection>
  );
};
