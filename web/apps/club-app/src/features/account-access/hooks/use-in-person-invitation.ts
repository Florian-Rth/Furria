import type { KkScreenActionBar } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
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
import type { AccessSubject, InPersonPurpose } from '../types';

const PERSON_ROUTE = '/manage/persons/$personId';
const TICK_MS = 1000;

interface InPersonInvitationInput {
  purpose: InPersonPurpose;
  subject: AccessSubject;
  onRedeemed: () => void;
}

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
  const issue = useInPersonInvitationMutation(purpose, subject.personId);
  const { mutate: issueCode } = issue;
  const hasIssued = useRef(false);
  const hasReportedRedemption = useRef(false);
  const navigate = useNavigate();
  const now = useNow(TICK_MS, issue.data !== undefined);
  const accessState = useAccessStateQuery(
    purpose,
    subject.personId,
    isCodeShowing(issue.data, issue.isPending, now),
  );

  const phase = inPersonPhaseOf({
    invitation: issue.data,
    isIssuing: issue.isPending,
    hasIssueFailed: issue.isError,
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
    void navigate({
      to: PERSON_ROUTE,
      params: { personId: String(subject.personId) },
      search: (previous) => ({ ...previous, changed: toAccessLandingKey(subject.personId) }),
      replace: true,
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
    rejection: toWriteErrorMessage(issue.error),
    action: toAction(),
  };
};
