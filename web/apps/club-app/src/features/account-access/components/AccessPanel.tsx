import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ACCESS_SECTION_TITLE,
  BIRTH_DATE_ACT_LABEL,
  BIRTH_DATE_ROW_META,
  IN_PERSON_ACT_LABEL,
  IN_PERSON_ROW_META,
  INVITATION_LABEL,
  MAIL_ACT_LABELS,
  RECOVERY_ACT_LABEL,
  RECOVERY_ROW_META,
  toAccessBlockNote,
  toAccessLandingKey,
  toInPersonHref,
  toInvitationSpan,
  toInvitationValidity,
  toInviteHref,
  toMailRowMeta,
  toNoMailAddressLine,
  toPersonEditHref,
  toRecoveryHref,
  toVouchLine,
} from '../account-access-labels';
import { useAccessActions } from '../hooks/use-access-actions';
import type { AccessSubject } from '../types';
import { AccessHistory } from './AccessHistory';
import { AccountLockAction } from './AccountLockAction';

interface AccessPanelProps {
  subject: AccessSubject;
  highlightedKey: string | null;
}

export const AccessPanel: FC<AccessPanelProps> = ({ subject, highlightedKey }) => {
  const { access } = subject;
  const {
    mailInvitation,
    inPersonInvitation,
    lacksMailAddress,
    vouchesForAge,
    recovery,
    lock,
    birthDateEntry,
  } = useAccessActions(subject);
  const landingKey = toAccessLandingKey(subject.personId);
  const isLanded = highlightedKey === landingKey;

  const birthDateRow = birthDateEntry ? (
    <KkHubRow
      label={BIRTH_DATE_ACT_LABEL}
      icon="edit"
      meta={BIRTH_DATE_ROW_META}
      component={Link}
      to={toPersonEditHref(subject.personId)}
    />
  ) : null;

  const mailRow =
    mailInvitation === null ? null : (
      <KkHubRow
        label={MAIL_ACT_LABELS[mailInvitation]}
        icon="mail"
        meta={toMailRowMeta(subject.email)}
        component={Link}
        to={toInviteHref(subject.personId)}
      />
    );

  const inPersonMeta = vouchesForAge
    ? toVouchLine(subject.firstName, access.ageOfConsent)
    : IN_PERSON_ROW_META;
  const inPersonRow = inPersonInvitation ? (
    <KkHubRow
      label={IN_PERSON_ACT_LABEL}
      icon="qr"
      meta={inPersonMeta}
      component={Link}
      to={toInPersonHref(subject.personId)}
    />
  ) : null;

  const recoveryRow = recovery ? (
    <KkHubRow
      label={RECOVERY_ACT_LABEL}
      icon="key"
      meta={RECOVERY_ROW_META}
      component={Link}
      to={toRecoveryHref(subject.personId)}
    />
  ) : null;

  const hasActs =
    birthDateEntry || mailRow !== null || inPersonRow !== null || recoveryRow !== null;
  const actsPanel = hasActs ? (
    <KkPanel highlight={isLanded} landing={landingKey}>
      {birthDateRow}
      {mailRow}
      {inPersonRow}
      {recoveryRow}
    </KkPanel>
  ) : null;

  const invitationPanel =
    access.invitation === null ? null : (
      <KkPanel highlight={!hasActs && isLanded} landing={hasActs ? undefined : landingKey}>
        <KkFieldRow
          label={INVITATION_LABEL}
          value={toInvitationSpan(access.invitation)}
          hint={toInvitationValidity(access.invitation)}
        />
      </KkPanel>
    );

  const blockText =
    birthDateEntry && !vouchesForAge
      ? null
      : toAccessBlockNote(access, subject.firstName, vouchesForAge);
  const blockLine =
    blockText === null ? null : (
      <KkNote tone="hint" icon="info">
        {blockText}
      </KkNote>
    );

  const noMailAddressText = toNoMailAddressLine(subject.firstName);
  const noMailAddressLine = lacksMailAddress ? (
    <KkNote tone="hint" icon="info">
      {noMailAddressText}
    </KkNote>
  ) : null;

  const lockAction = lock === null ? null : <AccountLockAction subject={subject} act={lock} />;

  return (
    <KkPanelSection title={ACCESS_SECTION_TITLE}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        {actsPanel}
        {invitationPanel}
        {blockLine}
        {noMailAddressLine}
        <AccessHistory history={access.history} />
        {lockAction}
      </Stack>
    </KkPanelSection>
  );
};
