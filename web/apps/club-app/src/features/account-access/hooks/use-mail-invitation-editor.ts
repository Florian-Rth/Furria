import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { accessActionsOf } from '../access-actions';
import {
  MAIL_ACT_LABELS,
  toAccessLandingKey,
  toInvitationConsequence,
  toNoMailInvitationLine,
} from '../account-access-labels';
import { useMailInvitationMutation } from '../api';
import type { AccessSubject } from '../types';

const PERSON_ROUTE = '/manage/persons/$personId';

interface MailInvitationEditorInput {
  subject: AccessSubject;
  onInvited: () => void;
}

export interface MailInvitationEditorControl {
  actionLabel: string;
  consequence: string;
  rejection: string | null;
  canSubmit: boolean;
  isSending: boolean;
  submit: () => void;
}

export const useMailInvitationEditor = ({
  subject,
  onInvited,
}: MailInvitationEditorInput): MailInvitationEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useMailInvitationMutation(subject, onInvited);
  const navigate = useNavigate();
  const { mailInvitation } = accessActionsOf(subject.access, subject.email);

  const landBack = (): void => {
    void navigate({
      to: PERSON_ROUTE,
      params: { personId: String(subject.personId) },
      search: (previous) => ({ ...previous, changed: toAccessLandingKey(subject.personId) }),
      replace: true,
    });
  };

  const submit = (): void => {
    if (mailInvitation === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(undefined, {
      onSuccess: landBack,
      onError: (error) => {
        setRejection(toWriteErrorMessage(error));
      },
    });
  };

  const consequence =
    mailInvitation === null || subject.email === null
      ? toNoMailInvitationLine(subject.access, subject.firstName)
      : toInvitationConsequence(subject.firstName, subject.email, mailInvitation);

  return {
    actionLabel: MAIL_ACT_LABELS[mailInvitation ?? 'invite'],
    consequence,
    rejection,
    canSubmit: mailInvitation !== null,
    isSending: mutation.isPending,
    submit,
  };
};
