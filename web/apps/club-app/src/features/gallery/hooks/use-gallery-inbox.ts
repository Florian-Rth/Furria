import type {
  KkLightTableCommit,
  KkLightTableDeparture,
  KkLightTableDone,
  KkLightTableFrame,
  KkLightTableStripFrame,
  KkLightTableTarget,
} from '@furria/ui';
import { useKkNotice, useKkSheetCommands } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { GALLERY_PATH } from '@/features/session';
import { useInboxQuery, useItemDeletion, usePlacement } from '../api';
import { countLabel, sceneSpanLabel, thumbSourceOf, viewSourceOf } from '../gallery-view';
import {
  COMMIT_FAILED,
  closeQuestionOf,
  commitLabelOf,
  DONE_HEADLINE,
  doneSummaryOf,
  EMPTY_BASKET,
  inboxTitleOf,
  sceneQuestionOf,
  stampOf,
  tallyLineOf,
} from '../inbox-copy';
import type { CommitPlan } from '../inbox-desk';
import {
  commitPlanOf,
  committedIdsOf,
  deskKeyOf,
  deskOf,
  isEmptyPlan,
  reconcileCulling,
} from '../inbox-desk';
import type { CullIntent } from '../light-table';
import { cull, openCount, startCulling, verdictCount, verdictOf } from '../light-table';
import type { InboxItem } from '../schemas';
import type { InboxBaskets } from './use-inbox-baskets';
import { useInboxBaskets } from './use-inbox-baskets';
import type { InboxOwnerChoice } from './use-inbox-owner';
import { useInboxOwner } from './use-inbox-owner';

export const INBOX_SHEET_ID = 'gallery-inbox-sheet';
const HURRY_MS = 260;
const STRIP_REACH = 14;

export interface GalleryInbox {
  title: string;
  remaining: string;
  tally: string;
  scene: string;
  position: string;
  frame: KkLightTableFrame | null;
  departure: KkLightTableDeparture | null;
  strip: KkLightTableStripFrame[];
  targets: KkLightTableTarget[];
  confirmQuestion: string | null;
  hurried: boolean;
  done: KkLightTableDone | null;
  commit: KkLightTableCommit | null;
  baskets: InboxBaskets;
  inboxOwner: InboxOwnerChoice;
  onStep: (delta: number) => void;
  onReject: (wholeScene: boolean) => void;
  onFile: (slot: number, wholeScene: boolean) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  onCommit: () => void;
  onSettings: () => void;
  onStripSelect: (id: string) => void;
}

interface Settled {
  filed: number;
  rejected: number;
}

const labelOf = (number: number): string => `Bild ${number}`;

export const useGalleryInbox = (): GalleryInbox => {
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const sheets = useKkSheetCommands();
  const inboxOwner = useInboxOwner();
  const baskets = useInboxBaskets();
  const inbox = useInboxQuery(inboxOwner.owner, true);
  const placement = usePlacement();
  const deletion = useItemDeletion();
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [settled, setSettled] = useState<Settled>({ filed: 0, rejected: 0 });
  const [committing, setCommitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [lastAt, setLastAt] = useState(0);
  const [hurried, setHurried] = useState(false);

  const desk = deskOf<InboxItem>(inbox.data?.items ?? [], hidden);
  const deskKey = deskKeyOf(desk.frames);
  const [state, setState] = useState(() => startCulling(desk.frames));
  const [seenKey, setSeenKey] = useState(deskKey);
  if (seenKey !== deskKey) {
    setSeenKey(deskKey);
    setState(reconcileCulling(state, desk.frames));
  }

  const plan: CommitPlan = commitPlanOf(state, baskets.slots);
  const itemOf = (id: number): InboxItem | undefined => desk.items.get(id);
  const numberOf = (id: number): number => state.frames.findIndex((frame) => frame.id === id) + 1;
  const basketTitleOf = (slot: number): string | null => baskets.albumOf(slot)?.title ?? null;

  const dispatch = (intent: CullIntent): void => {
    const now = performance.now();
    setHurried(now - lastAt < HURRY_MS);
    setLastAt(now);
    setState((current) => cull(current, intent));
  };

  const goBack = (): void => {
    void navigate({ to: GALLERY_PATH });
  };

  const commit = async (afterwards: () => void): Promise<void> => {
    if (isEmptyPlan(plan) || committing) {
      afterwards();
      return;
    }
    setCommitting(true);
    try {
      await Promise.all(
        plan.placements.map((placed) =>
          placement.mutateAsync({ albumId: placed.albumId, mediaItemIds: placed.mediaItemIds }),
        ),
      );
      if (plan.rejects.length > 0) {
        await deletion.mutateAsync(plan.rejects);
      }
      setHidden((current) => new Set([...current, ...committedIdsOf(plan)]));
      setSettled((current) => ({
        filed: current.filed + committedIdsOf(plan).length - plan.rejects.length,
        rejected: current.rejected + plan.rejects.length,
      }));
      afterwards();
    } catch {
      raiseNotice({ tone: 'error', message: COMMIT_FAILED });
    } finally {
      setCommitting(false);
      setClosing(false);
    }
  };

  const currentFrame = state.frames[state.cursor];
  const currentItem = currentFrame === undefined ? undefined : itemOf(currentFrame.id);
  const remaining = openCount(state);
  const sceneIndex = currentFrame?.scene ?? 0;
  const sceneFrames = state.frames.filter((frame) => frame.scene === sceneIndex);
  const inScene = sceneFrames.findIndex((frame) => frame.id === currentFrame?.id) + 1;
  const scene = desk.scenes[sceneIndex];
  const loaded = inbox.data !== undefined;
  const isDone = loaded && state.frames.length === 0 && desk.developing === 0;

  const departedItem = state.departure === null ? undefined : itemOf(state.departure.id);
  const departure: KkLightTableDeparture | null =
    state.departure === null || departedItem === undefined
      ? null
      : {
          key: state.departure.key,
          source: viewSourceOf(departedItem.kind, departedItem.urls),
          kind: state.departure.verdict.kind === 'rejected' ? 'reject' : 'file',
          slot: state.departure.verdict.kind === 'filed' ? state.departure.verdict.slot : 0,
          stamp:
            state.departure.verdict.kind === 'filed'
              ? stampOf(basketTitleOf(state.departure.verdict.slot) ?? EMPTY_BASKET)
              : '',
        };

  const strip: KkLightTableStripFrame[] = sceneFrames
    .filter((_frame, index) => Math.abs(index + 1 - inScene) <= STRIP_REACH)
    .flatMap((frame) => {
      const item = itemOf(frame.id);
      if (item === undefined) {
        return [];
      }
      const verdict = verdictOf(state, frame.id);
      return [
        {
          id: String(frame.id),
          label: labelOf(numberOf(frame.id)),
          source: thumbSourceOf(item.urls),
          verdict: verdict.kind,
          slot: verdict.kind === 'filed' ? verdict.slot + 1 : null,
          current: frame.id === currentFrame?.id,
        },
      ];
    });

  const targets: KkLightTableTarget[] = baskets.slots.map((_albumId, slot) => {
    const album = baskets.albumOf(slot);
    const stored = album === undefined ? 0 : album.photos + album.videos;
    return {
      id: `korb-${slot}`,
      title: album?.title ?? EMPTY_BASKET,
      count: countLabel(stored + verdictCount(state, 'filed', slot)),
    };
  });

  const pendingCount =
    state.pending === null
      ? 0
      : state.frames.filter(
          (frame) =>
            frame.scene === state.pending?.scene && verdictOf(state, frame.id).kind === 'open',
        ).length;
  const sceneQuestion =
    state.pending === null
      ? null
      : sceneQuestionOf(
          pendingCount,
          state.pending.verdict.kind === 'filed'
            ? (basketTitleOf(state.pending.verdict.slot) ?? EMPTY_BASKET)
            : null,
        );

  const onFile = (slot: number, wholeScene: boolean): void => {
    if (baskets.slots[slot] === null || baskets.slots[slot] === undefined) {
      sheets.open(INBOX_SHEET_ID);
      return;
    }
    dispatch({ kind: 'file', slot, wholeScene });
  };

  const onConfirm = (): void => {
    if (closing) {
      void commit(goBack);
    } else if (state.pending !== null) {
      dispatch({ kind: 'confirm' });
    } else {
      void commit(() => undefined);
    }
  };

  const onCancel = (): void => {
    if (closing) {
      setClosing(false);
    } else {
      dispatch({ kind: 'cancel' });
    }
  };

  const onClose = (): void => {
    if (isEmptyPlan(plan)) {
      goBack();
    } else {
      setClosing(true);
    }
  };

  return {
    title: inboxTitleOf(inboxOwner.ownerName),
    remaining: loaded ? countLabel(remaining) : '–',
    tally: tallyLineOf(
      settled.filed + verdictCount(state, 'filed'),
      settled.rejected + verdictCount(state, 'rejected'),
      desk.developing,
    ),
    scene: scene === undefined ? '' : `Szene ${sceneIndex + 1} · ${sceneSpanLabel(scene)}`,
    position: sceneFrames.length === 0 ? '' : `${inScene} / ${sceneFrames.length}`,
    frame:
      remaining === 0 || currentItem === undefined || currentFrame === undefined
        ? null
        : {
            id: String(currentItem.mediaItemId),
            label: labelOf(numberOf(currentFrame.id)),
            source: viewSourceOf(currentItem.kind, currentItem.urls),
          },
    departure,
    strip,
    targets,
    confirmQuestion: closing ? closeQuestionOf(plan) : sceneQuestion,
    hurried,
    done: isDone
      ? { headline: DONE_HEADLINE, summary: doneSummaryOf(settled.filed, settled.rejected) }
      : null,
    commit: isEmptyPlan(plan) ? null : { label: commitLabelOf(plan), busy: committing },
    baskets,
    inboxOwner,
    onStep: (delta) => dispatch({ kind: 'step', delta }),
    onReject: (wholeScene) => dispatch({ kind: 'reject', wholeScene }),
    onFile,
    onUndo: () => dispatch({ kind: 'undo' }),
    onConfirm,
    onCancel,
    onClose,
    onCommit: () => {
      void commit(() => undefined);
    },
    onSettings: () => sheets.open(INBOX_SHEET_ID),
    onStripSelect: (id) => dispatch({ kind: 'jump', id: Number(id) }),
  };
};
