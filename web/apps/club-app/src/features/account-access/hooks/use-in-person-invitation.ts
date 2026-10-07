import type { KkScreenActionBar } from '@furria/ui';
import { useEffect, useRef, useState } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { useNow } from '@/lib/use-now';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  IN_PERSON_FINISH_LABEL,
  IN_PERSON_REISSUE_LABEL,
  IN_PERSON_RETRY_LABEL,
  IN_PERSON_VALIDITY_NOTES,
  toAccessLandingKey,
} from '../account-access-labels';
import { useAccessStateQuery, useInPersonInvitationMutation } from '../api';
import type { InPersonPhase } from '../in-person-phase';
import { inPersonPhaseOf, isCodeShowing, isHandedOver } from '../in-person-phase';
import type { InPersonInvitation } from '../schemas';
import type { AccessSubject, InPersonPurpose } from '../types';

const PERSON_ROUTE = '/manage/persons/$personId';
const TICK_MS = 1000;

interface InPersonInvitationInput {
  purpose: InPersonPurpose;
  subject: AccessSubject;
  onRedeemed: () => void;
}

type IssueState =
  | { status: 'issuing' }
  | { status: 'issued'; invitation: InPersonInvitation }
  | { status: 'failed'; error: Error };

export interface InPersonInvitationControl {
  phase: InPersonPhase;
  rejection: string | null;
  action: KkScreenActionBar | undefined;
}

export const useInPersonInvitation = ({
  purpose,
  subject,
  onRedeemed,
}: InPersonInvitationInput): InPersonInvitationControl => {
  const { mutateAsync } = useInPersonInvitationMutation(purpose, subject.personId);
  const [issue, setIssue] = useState<IssueState>({ status: 'issuing' });
  const hasIssued = useRef(false);
  const hasReportedRedemption = useRef(false);
  const goBackTo = useGoBackTo();
  const invitation = issue.status === 'issued' ? issue.invitation : undefined;
  const isIssuing = issue.status === 'issuing';
  const now = useNow(TICK_MS, invitation !== undefined);
  const accessState = useAccessStateQuery(
    purpose,
    subject.personId,
    isCodeShowing(invitation, isIssuing, now),
  );

  const issueCode = (): void => {
    setIssue({ status: 'issuing' });
    mutateAsync().then(
      (issued) => setIssue({ status: 'issued', invitation: issued }),
      (error: Error) => setIssue({ status: 'failed', error }),
    );
  };

  const phase = inPersonPhaseOf({
    invitation,
    isIssuing,
    hasIssueFailed: issue.status === 'failed',
    isHandedOver: isHandedOver(purpose, accessState.data),
    now,
  });
  const isRedeemed = phase.kind === 'redeemed';

  useEffect(() => {
    if (hasIssued.current) {
      return;
    }

    hasIssued.current = true;
    issueCode();
  }, [issueCode]);

  useEffect(() => {
    if (!isRedeemed || hasReportedRedemption.current) {
      return;
    }

    hasReportedRedemption.current = true;
    onRedeemed();
  }, [isRedeemed, onRedeemed]);

  const reissue = (): void => {
    issueCode();
  };

  const finish = (): void => {
    void goBackTo({
      to: PERSON_ROUTE,
      params: { personId: String(subject.personId) },
      search: (previous) => ({ ...previous, changed: toAccessLandingKey(subject.personId) }),
      ignoreBlocker: true,
    });
  };

  const toAction = (): KkScreenActionBar | undefined => {
    if (phase.kind === 'redeemed') {
      return { primary: { label: IN_PERSON_FINISH_LABEL, icon: 'check', onSelect: finish } };
    }
    if (phase.kind === 'expired') {
      return {
        context: { text: IN_PERSON_VALIDITY_NOTES[purpose], tone: 'quiet' },
        primary: { label: IN_PERSON_REISSUE_LABEL, icon: 'qr', onSelect: reissue },
      };
    }
    if (phase.kind === 'failed') {
      return { primary: { label: IN_PERSON_RETRY_LABEL, onSelect: reissue } };
    }

    return undefined;
  };

  return {
    phase,
    rejection: toWriteErrorMessage(issue.status === 'failed' ? issue.error : null),
    action: toAction(),
  };
};
