import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect, useRef, useState } from 'react';
import { requestSuggestionSearch } from '@/features/running-order/requests';
import { bodyOf } from '@/features/running-order/running-order-ops';
import { reviewRunningOrder } from '@/features/running-order/running-order-review';
import type { LineKey, Suggestion, SuggestionLine } from '@/features/running-order/schemas';
import type { ReviewFinding, RunningOrderDraft } from '@/features/running-order/types';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  SUGGESTION_EMPTY,
  SUGGESTION_TAKEN,
  toHoldRelaxedMessage,
  toRowTakenMessage,
} from '../planner-copy';
import type { HoldRow } from '../planner-holds';
import { holdRowsOf, relaxHold } from '../planner-holds';
import type { ProposalRow, ProposalShift, SearchTally } from '../planner-suggestion';
import {
  acceptProposalRow,
  proposalRowsOf,
  proposalShiftsOf,
  proposedDraftOf,
  seedOf,
} from '../planner-suggestion';

interface Search {
  latest: Suggestion | null;
  kept: Suggestion | null;
  searching: boolean;
  explaining: boolean;
}

interface SearchStart {
  base: RunningOrderDraft;
  quiet: boolean;
  seed: readonly number[];
  seconds: number;
  kept: Suggestion | null;
}

export interface PlannerSuggestion {
  isLoading: boolean;
  isActive: boolean;
  rows: ProposalRow[];
  preview: RunningOrderDraft | null;
  previewFindings: ReviewFinding[] | null;
  shifts: ProposalShift[];
  proven: boolean;
  tally: SearchTally | null;
  holds: HoldRow[];
  unavoidable: boolean;
  explains: boolean;
  rowOf: (key: LineKey) => ProposalRow | null;
  request: () => void;
  searchOn: () => void;
  takeNow: () => void;
  acceptOne: (key: LineKey) => void;
  acceptAll: () => void;
  relax: (hold: HoldRow) => void;
  discard: () => void;
  cancel: () => void;
}

const FIRST_SEARCH_SECONDS = 5;
const LONGER_SEARCH_SECONDS = 30;

const explainsOf = (base: RunningOrderDraft, suggestion: Suggestion): boolean =>
  suggestion.conflictsAfter > 0 &&
  (suggestion.holdsUnavoidable || holdRowsOf(base, suggestion).length > 0);

const changesNothing = (base: RunningOrderDraft, suggestion: Suggestion): boolean =>
  proposalRowsOf(base, suggestion).length === 0 && !explainsOf(base, suggestion);

export const usePlannerSuggestion = (
  eventId: number,
  draft: RunningOrderDraft,
  findings: readonly ReviewFinding[],
  apply: (next: RunningOrderDraft, undoMessage?: string) => void,
  nameOf: (key: LineKey) => string,
): PlannerSuggestion => {
  const notify = useKkNotice();
  const [search, setSearch] = useState<Search | null>(null);
  const running = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      running.current?.abort();
    },
    [],
  );

  const live = search?.latest ?? null;
  const searching = search?.searching === true;
  const rows = live === null || search?.explaining === true ? [] : proposalRowsOf(draft, live);
  const preview = live === null || rows.length === 0 ? null : proposedDraftOf(draft, live);
  const previewFindings = preview === null ? null : reviewRunningOrder(preview);
  const holds =
    live === null || live.conflictsAfter === 0 || searching ? [] : holdRowsOf(draft, live);
  const unavoidable =
    live !== null && !searching && live.conflictsAfter > 0 && live.holdsUnavoidable;

  const stop = (): void => {
    running.current?.abort();
    running.current = null;
  };

  const settle = (base: RunningOrderDraft, line: SuggestionLine, quiet: boolean): void => {
    running.current = null;
    if (changesNothing(base, line)) {
      if (!quiet) {
        notify({ tone: 'info', message: SUGGESTION_EMPTY });
      }
      setSearch(null);
      return;
    }
    setSearch({ latest: line, kept: null, searching: false, explaining: false });
  };

  const start = ({ base, quiet, seed, seconds, kept }: SearchStart): void => {
    const controller = new AbortController();

    stop();
    running.current = controller;
    setSearch({ latest: kept, kept, searching: true, explaining: false });

    const onLine = (line: SuggestionLine): void => {
      if (controller.signal.aborted) {
        return;
      }
      if (line.final) {
        settle(base, line, quiet);
        return;
      }
      setSearch({ latest: line, kept, searching: true, explaining: false });
    };
    const body = { ...bodyOf(base), seedActIds: [...seed], searchSeconds: seconds };

    void withFreshAccessToken((accessToken) =>
      requestSuggestionSearch(eventId, { body, signal: controller.signal, onLine }, accessToken),
    )
      .then(() => {
        if (running.current !== controller) {
          return;
        }
        running.current = null;
        setSearch((previous) =>
          previous?.latest === null || previous === null
            ? null
            : { ...previous, kept: null, searching: false },
        );
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }
        running.current = null;
        setSearch(null);

        const message = toWriteErrorMessage(error);

        if (message !== null) {
          notify({ tone: 'error', message });
        }
      });
  };

  const ask = (base: RunningOrderDraft, quiet: boolean): void => {
    start({ base, quiet, seed: [], seconds: FIRST_SEARCH_SECONDS, kept: null });
  };

  return {
    isLoading: searching,
    isActive: preview !== null,
    rows,
    preview,
    previewFindings,
    shifts: previewFindings === null ? [] : proposalShiftsOf(findings, previewFindings),
    proven: live === null || live.proven,
    tally: live === null ? null : { before: live.conflictsBefore, after: live.conflictsAfter },
    holds,
    unavoidable,
    explains: holds.length > 0 || unavoidable,
    rowOf: (key) => rows.find((row) => row.key === key) ?? null,
    request: () => {
      ask(draft, false);
    },
    searchOn: () => {
      start({
        base: draft,
        quiet: false,
        seed: live === null ? [] : seedOf(live),
        seconds: LONGER_SEARCH_SECONDS,
        kept: live,
      });
    },
    takeNow: () => {
      stop();
      if (live === null || changesNothing(draft, live)) {
        setSearch(null);
        return;
      }
      setSearch({ latest: live, kept: null, searching: false, explaining: false });
    },
    acceptOne: (key) => {
      const row = rows.find((candidate) => candidate.key === key);

      if (row === undefined) {
        return;
      }

      const next = acceptProposalRow(draft, row);

      apply(next, toRowTakenMessage(nameOf(key), row.to));
      ask(next, true);
    },
    acceptAll: () => {
      if (preview === null || live === null) {
        return;
      }
      stop();
      apply(preview, SUGGESTION_TAKEN);
      setSearch(
        explainsOf(preview, live)
          ? { latest: live, kept: null, searching: false, explaining: true }
          : null,
      );
    },
    relax: (hold) => {
      const next = relaxHold(draft, hold);

      apply(next, toHoldRelaxedMessage(hold.kind));
      ask(next, false);
    },
    discard: () => {
      stop();
      setSearch(null);
    },
    cancel: () => {
      const kept = search?.kept ?? null;

      stop();
      setSearch(
        kept === null ? null : { latest: kept, kept: null, searching: false, explaining: false },
      );
    },
  };
};
