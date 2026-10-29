import { useKkNotice } from '@furria/ui/KkNotice';
import { useState } from 'react';
import { useSuggestionMutation } from '@/features/running-order/api';
import { bodyOf } from '@/features/running-order/running-order-ops';
import { reviewRunningOrder } from '@/features/running-order/running-order-review';
import type { LineKey, Suggestion } from '@/features/running-order/schemas';
import type { ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import {
  SUGGESTION_EMPTY,
  SUGGESTION_TAKEN,
  toHoldRelaxedMessage,
  toRowTakenMessage,
} from '../planner-copy';
import type { HoldRow } from '../planner-holds';
import { holdRowsOf, relaxHold } from '../planner-holds';
import type { ProposalRow, ProposalShift } from '../planner-suggestion';
import {
  acceptProposalRow,
  proposalRowsOf,
  proposalShiftsOf,
  proposedDraftOf,
  signatureOf,
} from '../planner-suggestion';

interface Proposal {
  suggestion: Suggestion;
  signature: string;
}

export interface PlannerSuggestion {
  isLoading: boolean;
  isActive: boolean;
  rows: ProposalRow[];
  preview: RunningOrderDraft | null;
  previewFindings: ReviewFinding[] | null;
  shifts: ProposalShift[];
  proven: boolean;
  holds: HoldRow[];
  unavoidable: boolean;
  explains: boolean;
  rowOf: (key: LineKey) => ProposalRow | null;
  request: () => void;
  acceptOne: (key: LineKey) => void;
  acceptAll: () => void;
  relax: (hold: HoldRow) => void;
  discard: () => void;
}

const explainsOf = (base: RunningOrderDraft, suggestion: Suggestion): boolean =>
  suggestion.conflictsAfter > 0 &&
  (suggestion.holdsUnavoidable || holdRowsOf(base, suggestion).length > 0);

export const usePlannerSuggestion = (
  eventId: number,
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
  apply: (next: RunningOrderDraft, undoMessage?: string) => void,
  nameOf: (key: LineKey) => string,
): PlannerSuggestion => {
  const mutation = useSuggestionMutation(eventId);
  const notify = useKkNotice();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const signature = signatureOf(draft);

  if (proposal !== null && proposal.signature !== signature) {
    setProposal(null);
  }

  const live = proposal !== null && proposal.signature === signature ? proposal.suggestion : null;
  const rows = live === null ? [] : proposalRowsOf(draft, live);
  const preview = live === null || rows.length === 0 ? null : proposedDraftOf(draft, live);
  const previewFindings = preview === null ? null : reviewRunningOrder(preview);
  const holds = live === null || live.conflictsAfter === 0 ? [] : holdRowsOf(draft, live);
  const unavoidable = live !== null && live.conflictsAfter > 0 && live.holdsUnavoidable;

  const ask = (base: RunningOrderDraft, quiet: boolean): void => {
    mutation.mutate(bodyOf(base), {
      onSuccess: (proposed) => {
        if (proposalRowsOf(base, proposed).length === 0 && !explainsOf(base, proposed)) {
          if (!quiet) {
            notify({ tone: 'info', message: SUGGESTION_EMPTY });
          }
          setProposal(null);
          return;
        }
        setProposal({ suggestion: proposed, signature: signatureOf(base) });
      },
    });
  };

  return {
    isLoading: mutation.isPending,
    isActive: preview !== null,
    rows,
    preview,
    previewFindings,
    shifts: previewFindings === null ? [] : proposalShiftsOf(findings, previewFindings),
    proven: live === null || live.proven,
    holds,
    unavoidable,
    explains: holds.length > 0 || unavoidable,
    rowOf: (key) => rows.find((row) => row.key === key) ?? null,
    request: () => {
      ask(draft, false);
    },
    acceptOne: (key) => {
      const row = rows.find((candidate) => candidate.key === key);

      if (row === undefined) {
        return;
      }

      const next = acceptProposalRow(draft, row);

      apply(next, toRowTakenMessage(nameOf(key), row.to));
      setProposal(null);
      ask(next, true);
    },
    acceptAll: () => {
      if (preview === null || live === null) {
        return;
      }
      apply(preview, SUGGESTION_TAKEN);
      setProposal(
        explainsOf(preview, live) ? { suggestion: live, signature: signatureOf(preview) } : null,
      );
    },
    relax: (hold) => {
      const next = relaxHold(draft, hold);

      apply(next, toHoldRelaxedMessage(hold.kind));
      setProposal(null);
      ask(next, false);
    },
    discard: () => {
      setProposal(null);
    },
  };
};
