import { useKkNotice } from '@furria/ui/KkNotice';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useEventQuery } from '@/features/events/api';
import type { EventDetails } from '@/features/events/schemas';
import { useActsQuery, useRunningOrdersQuery } from '@/features/running-order/api';
import {
  dissolveBlock,
  dropAct,
  isDroppable,
  moveUnit,
  pickActs,
  removeRule,
  toggleActWish,
  togglePin,
  unplace,
  unplacedLinesOf,
} from '@/features/running-order/running-order-ops';
import { tallyOf } from '@/features/running-order/running-order-review';
import type { CatalogueAct, LineKey } from '@/features/running-order/schemas';
import type {
  DraftLine,
  FindingTally,
  ReviewFinding,
  RuleKey,
  RunningOrderDraft,
} from '@/features/running-order/types';
import { useNow } from '@/lib/use-now';
import type { CatalogueRowState, CatalogueSection, PreviousEvening } from '../planner-catalogue';
import { catalogueRowStateOf, catalogueSectionsOf, previousEveningsOf } from '../planner-catalogue';
import {
  toAllPlacedMessage,
  toKeptForEveningMessage,
  toPickedMessage,
  toPlacedMessage,
  toRemovedMessage,
  toRowTakenMessage,
} from '../planner-copy';
import type { PlannerFix } from '../planner-fixes';
import { distinctFixesOf, placeAllAtBest, placeAtBest, unitLeadOf } from '../planner-fixes';
import type { ModeCounts } from '../planner-modes';
import { modeCountsOf } from '../planner-modes';
import type { PersonTimeline } from '../planner-person';
import { personTimelineOf } from '../planner-person';
import type { PlannerEntry, RailView } from '../planner-rows';
import { placeNumberOf, plannerEntriesOf, visibleEntriesOf } from '../planner-rows';
import { actsSessionOfEvening } from '../planner-session';
import type { LineWish } from '../planner-wishes';
import { eveningWishesOf, wishCountOf } from '../planner-wishes';
import type { PlannerMode } from '../schemas';
import type { PlannerBracket } from './use-planner-bracket';
import { usePlannerBracket } from './use-planner-bracket';
import type { PlannerDraft } from './use-planner-draft';
import { usePlannerDraft } from './use-planner-draft';
import type { PlannerDrag } from './use-planner-drag';
import { usePlannerDrag } from './use-planner-drag';
import type { PlannerSuggestion } from './use-planner-suggestion';
import { usePlannerSuggestion } from './use-planner-suggestion';

const ROUTE_ID = '/_app/events_/$eventId_/ablauf';
const NO_ACTS: readonly CatalogueAct[] = [];
const DEFAULT_MODE: PlannerMode = 'pick';
const CLOCK_MS = 60_000;
const RAIL_VIEWS: Record<PlannerMode, RailView> = {
  pick: 'none',
  order: 'all',
  check: 'all',
};

export interface RunningOrderPlanner {
  eventId: number;
  event: UseQueryResult<EventDetails, Error>;
  mode: PlannerMode;
  isWide: boolean;
  store: PlannerDraft;
  drag: PlannerDrag;
  bracket: PlannerBracket;
  suggestion: PlannerSuggestion;
  draft: RunningOrderDraft;
  shown: RunningOrderDraft;
  findings: ReviewFinding[];
  tally: FindingTally;
  entries: PlannerEntry[];
  allEntries: PlannerEntry[];
  unplaced: DraftLine[];
  counts: ModeCounts;
  catalogue: CatalogueSection[];
  catalogueReady: boolean;
  previous: PreviousEvening[];
  rowStateOf: (actId: number) => CatalogueRowState;
  eveningWishes: LineWish[];
  selectedKey: LineKey | null;
  person: PersonTimeline | null;
  wishesOpen: boolean;
  wishCount: number;
  railFixOf: (railKey: string) => PlannerFix | null;
  findingFixes: (PlannerFix | null)[];
  nameOf: (actId: number | null) => string | null;
  lineNameOf: (key: LineKey) => string;
  personNamesOf: (personIds: readonly number[]) => string[];
  peopleOf: (personIds: readonly number[]) => { personId: number; name: string }[];
  openPerson: (personId: number) => void;
  closePerson: () => void;
  openStop: (key: LineKey) => void;
  setMode: (mode: PlannerMode) => void;
  select: (key: LineKey) => void;
  closeSelection: () => void;
  openWishes: () => void;
  closeWishes: () => void;
  toggle: (actId: number) => void;
  pickMany: (actIds: readonly number[]) => void;
  drop: (key: LineKey) => void;
  place: (key: LineKey) => void;
  placeAll: () => void;
  unplaceLine: (key: LineKey) => void;
  togglePinOf: (key: LineKey) => void;
  dissolve: (key: LineKey) => void;
  moveTo: (key: LineKey, index: number) => void;
  applyFix: (fix: PlannerFix) => void;
  removeRuleOf: (ruleKey: RuleKey) => void;
  toggleWish: (actWishId: number) => void;
}

export const useRunningOrderPlanner = (eventId: number): RunningOrderPlanner => {
  const { mode = DEFAULT_MODE } = useSearch({ from: ROUTE_ID });
  const navigate = useNavigate();
  const isWide = useIsMediumScreen();
  const event = useEventQuery(eventId);
  const now = useNow(CLOCK_MS);
  const acts = useActsQuery(
    actsSessionOfEvening(event.data?.startsAt ?? null, now),
    event.data !== undefined,
  );
  const runningOrders = useRunningOrdersQuery();
  const store = usePlannerDraft(eventId);
  const notify = useKkNotice();
  const { draft, apply } = store;
  const drag = usePlannerDrag(draft, apply);
  const bracket = usePlannerBracket(draft, drag.listRef, apply);
  const lineNameOf = (key: LineKey): string =>
    draft.lines.find((candidate) => candidate.key === key)?.act.name ?? '';
  const dropLine = (line: DraftLine): void => {
    if (!isDroppable(line)) {
      notify({ tone: 'info', message: toKeptForEveningMessage(line.act.name) });
      return;
    }
    apply(dropAct(draft, line.act.actId), toRemovedMessage(line.act.name));
  };
  const suggestion = usePlannerSuggestion(eventId, draft, store.findings, apply, lineNameOf);
  const [selectedKey, setSelectedKey] = useState<LineKey | null>(null);
  const [personId, setPersonId] = useState<number | null>(null);
  const [wishesOpen, setWishesOpen] = useState(false);
  const catalogueActs = acts.data?.acts ?? NO_ACTS;
  const shown = bracket.shownDraft ?? suggestion.preview ?? draft;
  const findings = suggestion.previewFindings ?? store.findings;
  const allEntries = plannerEntriesOf(shown, findings);
  const railView = RAIL_VIEWS[mode];
  const entries = visibleEntriesOf(allEntries, railView);
  const settled =
    !suggestion.isActive && drag.draggingKeys.length === 0 && bracket.shownDraft === null;
  const rails = entries.flatMap((entry) => (entry.type === 'rail' ? [entry] : []));
  const railFixes =
    settled && mode === 'check'
      ? distinctFixesOf(
          draft,
          rails.map((rail) => rail.findings),
        )
      : [];
  const paneFixes =
    settled && isWide && mode === 'order' && selectedKey === null
      ? distinctFixesOf(
          draft,
          store.findings.map((finding) => [finding]),
        )
      : [];
  const names = new Map([
    ...catalogueActs.map((act) => [act.actId, act.name] as const),
    ...draft.lines.map((line) => [line.act.actId, line.act.name] as const),
  ]);
  const people = new Map(
    draft.lines.flatMap((line) =>
      line.act.cast.map((person) => [person.personId, person.firstName] as const),
    ),
  );

  if (selectedKey !== null && !draft.lines.some((line) => line.key === selectedKey)) {
    setSelectedKey(null);
  }

  const person = personId === null ? null : personTimelineOf(shown, personId);

  if (personId !== null && person === null) {
    setPersonId(null);
  }

  const nameOf = (actId: number | null): string | null =>
    actId === null ? null : (names.get(actId) ?? null);

  return {
    eventId,
    event,
    mode,
    isWide,
    store,
    drag,
    bracket,
    suggestion,
    draft,
    shown,
    findings,
    tally: tallyOf(store.findings),
    entries,
    allEntries,
    unplaced: unplacedLinesOf(shown),
    counts: modeCountsOf(draft, store.findings),
    catalogue: catalogueSectionsOf(catalogueActs),
    catalogueReady: event.data !== undefined && acts.data !== undefined && !acts.isPlaceholderData,
    previous: previousEveningsOf(
      runningOrders.data?.runningOrders ?? [],
      eventId,
      catalogueActs,
      draft,
    ),
    rowStateOf: (actId) => catalogueRowStateOf(draft, actId),
    eveningWishes: eveningWishesOf(draft, store.findings),
    selectedKey,
    person,
    wishesOpen,
    wishCount: wishCountOf(draft),
    railFixOf: (railKey) => railFixes[rails.findIndex((rail) => rail.key === railKey)] ?? null,
    findingFixes: paneFixes,
    nameOf,
    lineNameOf,
    personNamesOf: (personIds) =>
      personIds.flatMap((personId) => {
        const name = people.get(personId);

        return name === undefined ? [] : [name];
      }),
    peopleOf: (personIds) =>
      personIds.flatMap((personId) => {
        const name = people.get(personId);

        return name === undefined ? [] : [{ personId, name }];
      }),
    openPerson: (next) => {
      setPersonId(next);
    },
    closePerson: () => {
      setPersonId(null);
    },
    openStop: (key) => {
      if (!isWide) {
        setPersonId(null);
      }
      setSelectedKey(key);
      drag.listRef.current
        ?.querySelector(`[data-kk-numbered-row="${key}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    setMode: (next) => {
      suggestion.discard();
      setWishesOpen(false);
      void navigate({
        to: '/events/$eventId/ablauf',
        params: { eventId: String(eventId) },
        search: { mode: next === DEFAULT_MODE ? undefined : next },
        replace: true,
        resetScroll: false,
      });
    },
    select: (key) => {
      setPersonId(null);
      setSelectedKey(key);
    },
    closeSelection: () => {
      setSelectedKey(null);
    },
    openWishes: () => {
      if (isWide) {
        setSelectedKey(null);
        setPersonId(null);
      }
      setWishesOpen(true);
    },
    closeWishes: () => {
      setWishesOpen(false);
    },
    toggle: (actId) => {
      const line = draft.lines.find((candidate) => candidate.act.actId === actId);

      if (line === undefined) {
        apply(pickActs(draft, catalogueActs, [actId]));
        return;
      }
      dropLine(line);
    },
    pickMany: (actIds) => {
      const picked = pickActs(draft, catalogueActs, actIds);
      const added = picked.lines.length - draft.lines.length;

      apply(picked, toPickedMessage(added));
    },
    drop: (key) => {
      const line = draft.lines.find((candidate) => candidate.key === key);

      if (line !== undefined) {
        dropLine(line);
      }
    },
    place: (key) => {
      const next = placeAtBest(draft, key);

      apply(next, toPlacedMessage(lineNameOf(key), placeNumberOf(next, key)));
    },
    placeAll: () => {
      const waiting = unplacedLinesOf(draft).length;

      apply(placeAllAtBest(draft), toAllPlacedMessage(waiting));
    },
    unplaceLine: (key) => {
      apply(unplace(draft, key));
    },
    togglePinOf: (key) => {
      apply(togglePin(draft, key));
    },
    dissolve: (key) => {
      apply(dissolveBlock(draft, key));
    },
    moveTo: (key, index) => {
      apply(moveUnit(draft, unitLeadOf(draft, key), index));
    },
    applyFix: (fix) => {
      apply(moveUnit(draft, fix.key, fix.to), toRowTakenMessage(lineNameOf(fix.key), fix.to));
    },
    removeRuleOf: (ruleKey) => {
      apply(removeRule(draft, ruleKey));
    },
    toggleWish: (actWishId) => {
      apply(toggleActWish(draft, actWishId));
    },
  };
};
