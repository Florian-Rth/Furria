import { useState } from 'react';

export interface MembershipEditorTarget {
  membershipId: number | null;
}

export interface PauseEditorTarget {
  membershipId: number;
  pauseId: number | null;
}

export interface FeeReductionEditorTarget {
  feeReductionId: number | null;
}

type OpenEditor =
  | { kind: 'membership'; target: MembershipEditorTarget }
  | { kind: 'pause'; target: PauseEditorTarget }
  | { kind: 'feeReduction'; target: FeeReductionEditorTarget };

export interface FactEditor {
  membership: MembershipEditorTarget | null;
  pause: PauseEditorTarget | null;
  feeReduction: FeeReductionEditorTarget | null;
  endedMembershipId: number | null;
  openMembership: (membershipId: number | null) => void;
  openPause: (membershipId: number, pauseId: number | null) => void;
  openFeeReduction: (feeReductionId: number | null) => void;
  openEndMembership: (membershipId: number) => void;
  close: () => void;
}

export const useFactEditor = (): FactEditor => {
  const [open, setOpen] = useState<OpenEditor | null>(null);
  const [endedMembershipId, setEndedMembershipId] = useState<number | null>(null);

  const close = (): void => {
    setOpen(null);
    setEndedMembershipId(null);
  };

  const openMembership = (membershipId: number | null): void => {
    setEndedMembershipId(null);
    setOpen({ kind: 'membership', target: { membershipId } });
  };

  const openPause = (membershipId: number, pauseId: number | null): void => {
    setEndedMembershipId(null);
    setOpen({ kind: 'pause', target: { membershipId, pauseId } });
  };

  const openFeeReduction = (feeReductionId: number | null): void => {
    setEndedMembershipId(null);
    setOpen({ kind: 'feeReduction', target: { feeReductionId } });
  };

  const openEndMembership = (membershipId: number): void => {
    setOpen(null);
    setEndedMembershipId(membershipId);
  };

  return {
    membership: open?.kind === 'membership' ? open.target : null,
    pause: open?.kind === 'pause' ? open.target : null,
    feeReduction: open?.kind === 'feeReduction' ? open.target : null,
    endedMembershipId,
    openMembership,
    openPause,
    openFeeReduction,
    openEndMembership,
    close,
  };
};
