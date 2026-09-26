import type { KkPanelAction } from '@furria/ui';
import { KkChip, KkFieldRow, KkHubRow, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ACCESS_SECTION_TITLE,
  ACCESS_STATE_LABEL,
  IN_PERSON_ACT_LABEL,
  IN_PERSON_ROW_META,
  INVITATION_LABEL,
  MAIL_ACT_LABELS,
  MAIL_PILL_LABELS,
  RECOVERY_ACT_LABEL,
  RECOVERY_ROW_META,
  toAccessBlockNote,
  toAccessLandingKey,
  toAccountStateChip,
  toInPersonHref,
  toInvitationSpan,
  toInvitationValidity,
  toRecoveryHref,
  toVouchLine,
} from '../account-access-labels';
import { useAccessActions } from '../hooks/use-access-actions';
import type { AccessSubject } from '../types';
import { AccessHistory } from './AccessHistory';
import { AccountLockAction } from './AccountLockAction';

const INVITE_ROUTE = '/manage/persons/$personId/invitations/new';

interface AccessPanelProps {
  subject: AccessSubject;
  highlightedKey: string | null;
  onChanged: () => void;
}

export const AccessPanel: FC<AccessPanelProps> = ({ subject, highlightedKey, onChanged }) => {
  const { access } = subject;
  const { mailInvitation, inPersonInvitation, vouchesForAge, recovery, lock } =
    useAccessActions(subject);
  const chip = toAccountStateChip(access.state);
  const landingKey = toAccessLandingKey(subject.personId);
  const vouchLine = toVouchLine(subject.firstName, access.ageOfConsent);

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
  const inPersonMeta = vouchesForAge ? vouchLine : IN_PERSON_ROW_META;
  const inPersonRow = inPersonInvitation ? (
    <KkHubRow
      label={IN_PERSON_ACT_LABEL}
      icon="qr"
      meta={inPersonMeta}
      component={Link}
      to={inPersonHref}
    />
  ) : null;

  const recoveryHref = toRecoveryHref(subject.personId);
  const recoveryRow = recovery ? (
    <KkHubRow
      label={RECOVERY_ACT_LABEL}
      icon="key"
      meta={RECOVERY_ROW_META}
      component={Link}
      to={recoveryHref}
    />
  ) : null;

  const handoverPanel =
    inPersonRow === null && recoveryRow === null ? null : (
      <KkPanel>
        {inPersonRow}
        {recoveryRow}
      </KkPanel>
    );

  const blockText = toAccessBlockNote(access, subject.firstName, vouchesForAge);
  const blockLine =
    blockText === null ? null : (
      <KkNote tone="hint" icon="info">
        {blockText}
      </KkNote>
    );

  const lockAction =
    lock === null ? null : <AccountLockAction subject={subject} act={lock} onLocked={onChanged} />;

  return (
    <KkPanelSection title={ACCESS_SECTION_TITLE} action={action}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
          <KkFieldRow label={ACCESS_STATE_LABEL} value={stateChip} />
          {invitationRow}
        </KkPanel>
        {handoverPanel}
        {blockLine}
        <AccessHistory history={access.history} />
        {lockAction}
      </Stack>
    </KkPanelSection>
  );
};
