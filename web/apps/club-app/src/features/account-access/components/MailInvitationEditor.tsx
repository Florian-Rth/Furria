import type { KkScreenOrigin } from '@furria/ui';
import { KkFactRow, KkFieldRow, KkNote, KkPanel, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import {
  INVITATION_CHAIN_TITLE,
  MAIL_INVITATION_VALIDITY_NOTE,
  toInvitationSpan,
  toInvitationValidity,
} from '../account-access-labels';
import { useMailInvitationEditor } from '../hooks/use-mail-invitation-editor';
import type { AccessSubject } from '../types';

const RECIPIENT_LABEL = 'An';
const MISSING_VALUE = 'nicht hinterlegt';

interface MailInvitationEditorProps {
  subject: AccessSubject;
  origin: KkScreenOrigin;
  onInvited: () => void;
}

export const MailInvitationEditor: FC<MailInvitationEditorProps> = ({
  subject,
  origin,
  onInvited,
}) => {
  const control = useMailInvitationEditor({ subject, onInvited });
  const { invitation } = subject.access;

  const chain =
    invitation === null ? null : (
      <KkWriteScreen.Chain title={INVITATION_CHAIN_TITLE}>
        <KkFactRow title={toInvitationSpan(invitation)} span={toInvitationValidity(invitation)} />
      </KkWriteScreen.Chain>
    );

  return (
    <WriteScreen
      origin={origin}
      title={control.actionLabel}
      rejection={control.rejection ?? undefined}
      isDirty={false}
      action={{
        context: { text: control.consequence, tone: 'consequence' },
        primary: {
          label: control.actionLabel,
          icon: 'mail',
          onSelect: control.submit,
          loading: control.isSending,
          disabled: !control.canSubmit,
        },
      }}
    >
      {chain}
      <KkPanel>
        <KkFieldRow label={RECIPIENT_LABEL} value={subject.email ?? MISSING_VALUE} />
      </KkPanel>
      <KkNote tone="muted">{MAIL_INVITATION_VALIDITY_NOTE}</KkNote>
    </WriteScreen>
  );
};
