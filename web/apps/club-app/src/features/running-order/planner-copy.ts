import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkSeverity } from '@furria/ui/KkSeverityGlyph';
import {
  toActKindLabel,
  toActKindPlural,
  toFindingTitle,
  toNameList,
  toRulePhrase,
  toRuleSentence,
} from '@/features/running-order/running-order-copy';
import type {
  ActKind,
  FindingKind,
  HoldKind,
  LineKey,
  RuleKind,
  Strength,
} from '@/features/running-order/schemas';
import type {
  FindingTally,
  ReviewFinding,
  RunningOrderDraft,
} from '@/features/running-order/types';
import type { PlannerFix } from './planner-fixes';
import type { HoldRow } from './planner-holds';
import type { StepBlock } from './planner-modes';
import type { PersonGap, PersonTimeline } from './planner-person';
import type { LineWish, WishState, WishTally } from './planner-wishes';
import type { EveningChange, PlannerMode } from './schemas';

export const FACT_SEPARATOR = '\u00a0· ';

export const PAGE_TITLE = 'Ablauf';
export const LIST_LABEL = 'Ablauf des Abends';
export const MODE_SWITCH_LABEL = 'Ansicht';
export const OPEN_LABEL = 'Öffnen';
export const LOADING_LABEL = 'Ablauf wird geladen';
export const RETRY_LABEL = 'Erneut versuchen';
export const LOAD_FAILED = 'Der Ablauf konnte nicht geladen werden.';
export const EVENT_MISSING = 'Diese Veranstaltung gibt es nicht.';
export const UNDO_LABEL = 'Rückgängig';
export const RELOAD_LABEL = 'Neu laden';
export const CLOSE_LABEL = 'Schließen';
export const NONE = 'keine';
export const POINTS_TITLE = 'Ablaufpunkte';
export const CATALOGUE_TITLE = 'Katalog';
export const CATALOGUE_EMPTY = 'Keine Auftritte angelegt.';
export const MANAGE_ACTS_LABEL = 'Auftritte verwalten';
export const NEW_ACT_LABEL = 'Neuer Auftritt';
export const EVENING_EMPTY = 'Noch kein Auftritt im Abend.';
export const UNPLACED_TITLE = 'Noch nicht eingeplant';
export const PARK_LABEL = 'Zurückstellen';
export const PIN_SHORT_LABEL = 'Festhalten';
export const UNPIN_SHORT_LABEL = 'Freigeben';
export const UNBRACKET_SHORT_LABEL = 'Trennen';
export const REMOVE_SHORT_LABEL = 'Entfernen';
export const PLACE_LABEL = 'Einplanen';
export const ADD_LABEL = 'In den Abend';
export const REMOVE_LABEL = 'Aus dem Abend';
export const PIN_LABEL = 'Platz festhalten';
export const UNPIN_LABEL = 'Platz freigeben';
export const DRAG_LABEL = 'Ziehen zum Verschieben';
export const BRACKET_LABEL = 'Mit Nachbarn zusammenhalten';
export const UNBRACKET_LABEL = 'Nicht mehr zusammenhalten';
export const ACCEPT_LABEL = 'Übernehmen';
export const ACCEPT_ALL_LABEL = 'Alle übernehmen';
export const DISCARD_LABEL = 'Verwerfen';
export const SUGGEST_LABEL = 'Vorschlag';
export const CONFIRM_LABEL = 'Ablauf steht';
export const REOPEN_LABEL = 'Wieder öffnen';
export const CONFIRM_HINT = 'Halten, um den Ablauf festzuhalten';
export const EVENING_WISH_LABEL = 'Wunsch';
export const EVENING_WISH_ARIA_LABEL = 'Wunsch für den ganzen Abend';
export const EVENING_WISHES_TITLE = 'Für den ganzen Abend';
export const CAST_TITLE = 'Wer steht drin';
export const CAST_EMPTY = 'Niemand eingetragen.';
export const ABSENT_LABEL = 'abgesagt';
export const WISHES_TITLE = 'Wünsche';
export const PLACES_TITLE = 'Platz wählen';
export const NEW_WISH_TITLE = 'Neuer Wunsch';
export const WHAT_LABEL = 'Was?';
export const HOW_LABEL = 'Wie fest?';
export const OTHER_LABEL = 'Welcher Auftritt?';
export const KIND_LABEL = 'Welche Art?';
export const ADD_WISH_LABEL = 'Wunsch hinzufügen';
export const DUPLICATE_WISH = 'Diesen Wunsch gibt es schon.';
export const PICK_A_WISH = 'Wähle, was passieren soll.';
export const PICK_OTHER = 'Wähle den anderen Auftritt.';
export const TODAY_SWITCH_ON = 'Heute an';
export const TODAY_SWITCH_OFF = 'Heute aus';
export const REMOVE_WISH_LABEL = 'Wunsch entfernen';
export const FINDINGS_TITLE = 'Was nicht passt';
export const ALL_FINE = 'Alles passt.';
export const SUGGESTION_TITLE = 'Vorschlag';
export const SUGGESTION_EMPTY = 'Schon die beste Reihenfolge.';
export const AUTO_ORDER_LABEL = 'Automatisch ordnen';
export const NOT_PROVEN = 'Beste gefundene Reihenfolge';
export const SEARCH_ON_LABEL = 'Weiter suchen';
export const SEARCH_STOP_LABEL = 'Abbrechen';
export const TAKE_NOW_LABEL = 'Jetzt nehmen';
export const SEARCHING_NOTICE = 'Sucht die beste Reihenfolge …';

export const toSearchNotice = (tally: { before: number; after: number } | null): string =>
  tally === null ? SEARCHING_NOTICE : `Sucht … Konflikte ${tally.before} → ${tally.after}`;
export const NEWLY_PLACED = 'neu eingeplant';
export const ARCHIVED_FACT = 'archiviert';
export const PLACE_ALL_LABEL = 'Alle einplanen';
export const PROPOSAL_SHIFTS_LABEL = 'Was sich ändert';
export const CONFLICT_RELOAD =
  'Jemand anderes hat den Ablauf gerade geändert. Lade ihn neu, bevor du weitermachst.';
export const CONFIRM_QUESTION: {
  eyebrow: string;
  question: string;
  explanation: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
} = {
  eyebrow: 'Ablauf',
  question: 'Ablauf festhalten?',
  explanation: 'Alle sehen dann, dass der Ablauf steht. Spätere Änderungen werden markiert.',
  confirmLabel: 'Ablauf steht',
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
};

export const MODE_LABELS: Record<PlannerMode, string> = {
  pick: 'Wählen',
  order: 'Ordnen',
  check: 'Prüfen',
};

export const MODE_ICONS: Record<PlannerMode, KkIconName> = {
  pick: 'add',
  order: 'drag',
  check: 'checkCircle',
};

const MODE_COUNT_NOUNS: Record<PlannerMode, [string, string]> = {
  pick: ['Auftritt', 'Auftritte'],
  order: ['fester Platz', 'feste Plätze'],
  check: ['Befund', 'Befunde'],
};

export const toModeCountLabel = (mode: PlannerMode, count: number): string => {
  const [one, many] = MODE_COUNT_NOUNS[mode];

  return `${count} ${count === 1 ? one : many}`;
};

export const toNextModeLabel = (mode: PlannerMode): string => `Weiter: ${MODE_LABELS[mode]}`;

export const BACK_LABEL = 'Zurück';
export const WISHES_PANE_LABEL = 'Ansicht der Seitenleiste';
export const ACTS_WISHES_TITLE = 'Pro Auftritt';
export const CANCEL_LABEL = 'Abbrechen';

export const toAddActWishLabel = (name: string): string => `Wunsch für ${name}`;

export const toWishGroupMeta = (tally: WishTally): string | null => {
  if (tally.total === 0) {
    return null;
  }

  const wishes = count(tally.total, 'Wunsch', 'Wünsche');

  return tally.missed === 0 ? wishes : `${wishes}${FACT_SEPARATOR}${tally.missed} heute verfehlt`;
};

export const toWishesToolLabel = (count: number): string => `Wünsche ${count}`;

export const toStepBlockText = (block: StepBlock): string => {
  switch (block.reason) {
    case 'nonePicked':
      return 'Noch kein Auftritt gewählt';
    case 'unplaced':
      return `Noch ${toActsLabel(block.count)} nicht eingeplant`;
    case 'conflicts':
      return `Noch ${block.count} ${block.count === 1 ? 'Konflikt' : 'Konflikte'}`;
    case 'saving':
      return 'Wird gespeichert …';
  }
};

export const toActsLabel = (count: number): string =>
  `${count} ${count === 1 ? 'Auftritt' : 'Auftritte'}`;

export const toCastFact = (present: number, absent: number): string =>
  absent === 0 ? `${present} dabei` : `${present} dabei${FACT_SEPARATOR}${absent} abgesagt`;

export const EVENING_CHANGE_WORDS: Record<EveningChange, string> = {
  cast: 'Besetzung',
  spots: 'Plätze',
  choreography: 'Aufstellung',
};
const EVENING_CHANGED = 'für den Abend angepasst';

export const toEveningChangesFact = (
  changes: readonly EveningChange[],
  compact: boolean,
): string =>
  compact
    ? EVENING_CHANGED
    : `${EVENING_CHANGED}: ${changes.map((change) => EVENING_CHANGE_WORDS[change]).join(', ')}`;

export const toKindFact = (kind: ActKind | null): string | null =>
  kind === null ? null : toActKindLabel(kind);

export const toCatalogueMeta = (picked: number, total: number): string => `${picked}/${total}`;

export const NEW_IN_EVENING = 'neu';

export const toPickedContext = (count: number): string => `${toActsLabel(count)} gewählt`;

export const toPreviousLabel = (title: string, missing: number): string =>
  `Wie ${title}${FACT_SEPARATOR}${missing}`;

export const toReadout = (conflicts: number): string =>
  conflicts === 0 ? 'ohne Konflikt' : `${conflicts} ${conflicts === 1 ? 'Konflikt' : 'Konflikte'}`;

export const toPlaceTitle = (previous: string | null, last: boolean): string => {
  if (previous === null) {
    return last ? 'einziger Platz' : 'ganz am Anfang';
  }

  return last ? 'ganz am Ende' : `nach ${previous}`;
};

export const PLACE_CURRENT = 'jetzt hier';
export const PLACE_RECOMMENDED = 'empfohlen';

const count = (amount: number, one: string, many: string): string =>
  `${amount} ${amount === 1 ? one : many}`;

export const toPlaceTotal = (tally: FindingTally): string => {
  if (tally.conflicts > 0) {
    return count(tally.conflicts, 'Konflikt', 'Konflikte');
  }

  return tally.hints > 0 ? count(tally.hints, 'Hinweis', 'Hinweise') : 'ohne Konflikt';
};

export const toTallySeverity = (tally: FindingTally): KkSeverity => {
  if (tally.conflicts > 0) {
    return 'conflict';
  }

  return tally.hints > 0 ? 'hint' : 'met';
};

export const toPlaceChange = (delta: FindingTally): string | null => {
  const [amount, one, many] =
    delta.conflicts === 0
      ? [delta.hints, 'Hinweis', 'Hinweise']
      : [delta.conflicts, 'Konflikt', 'Konflikte'];

  if (amount === 0) {
    return null;
  }

  return `${count(Math.abs(amount), one, many)} ${amount > 0 ? 'mehr' : 'weniger'}`;
};

export const toRemovedMessage = (name: string): string => `${name} aus dem Abend genommen.`;

export const toKeptForEveningMessage = (name: string): string =>
  `${name} ist für diesen Abend angepasst und bleibt im Ablauf, solange die Anpassung besteht.`;

export const toPickedMessage = (count: number, archivedLeftOut = 0): string =>
  archivedLeftOut === 0
    ? `${toActsLabel(count)} übernommen.`
    : `${toActsLabel(count)} übernommen · ${toArchivedActsLabel(archivedLeftOut)} nicht übernommen.`;

export const toArchivedActsLabel = (count: number): string =>
  count === 1 ? '1 archivierter Auftritt' : `${count} archivierte Auftritte`;

export const toSaveFailedMessage = (reason: string): string => `Nicht gespeichert. ${reason}`;

export const SUGGESTION_TAKEN = 'Vorschlag übernommen.';

export const toPlaceNumber = (index: number): string => `Nr. ${index + 1}`;

export const toRowTakenMessage = (name: string, to: number): string =>
  `${name} auf ${toPlaceNumber(to)}.`;

export const toPlacedMessage = (name: string, placeNumber: number | null): string =>
  placeNumber === null ? `${name} eingeplant.` : `${name} auf Nr. ${placeNumber} eingeplant.`;

export const toAllPlacedMessage = (count: number): string => `${toActsLabel(count)} eingeplant.`;

export const toMovedCount = (count: number): string => `${toActsLabel(count)} verschoben`;

const SHIFT_LABELS: Record<FindingKind, string> = {
  noChangeover: 'keine Umziehzeit',
  tightChangeover: 'knapper Wechsel',
  mustRuleBroken: 'feste Wünsche',
  preferRuleMissed: 'Wünsche',
  sameKindAdjacent: 'Reden hintereinander',
  nobodyThere: 'alle abgesagt',
  absences: 'Absagen',
  unplaced: 'nicht eingeplant',
};

export const toShiftLabel = (kind: FindingKind): string => SHIFT_LABELS[kind];

export const toFixLabel = (name: string, fix: PlannerFix): string =>
  `${name} ${fix.fromTray ? 'einplanen auf' : 'auf'} ${toPlaceNumber(fix.to)}`;

export const toSeverity = (finding: ReviewFinding): KkSeverity =>
  finding.severity === 'conflict' ? 'conflict' : 'hint';

export const toWishSeverity = (state: WishState): KkSeverity => state;

const WISH_STATE_LABELS: Record<WishState, string> = {
  met: 'heute erfüllt',
  conflict: 'heute verfehlt',
  hint: 'heute verfehlt',
  off: 'heute aus',
};

export const toWishStateLabel = (state: WishState): string => WISH_STATE_LABELS[state];

const INVERTED: Partial<Record<RuleKind, RuleKind>> = { before: 'after', after: 'before' };

export const wishIconOf = (wish: LineWish): KkIconName => {
  switch (wish.source) {
    case 'pin':
      return 'pinFilled';
    case 'block':
      return 'link';
    default:
      return 'wish';
  }
};

export const toWishLabel = (
  wish: LineWish,
  actId: number | null,
  nameOf: (actId: number | null) => string | null,
): string => {
  if (wish.source === 'pin') {
    return 'Fester Platz';
  }
  if (wish.source === 'block' || wish.kind === null) {
    return 'Bleibt zusammen';
  }

  const mirrored = wish.otherActId === actId && wish.actId !== actId;
  const kind = mirrored ? (INVERTED[wish.kind] ?? wish.kind) : wish.kind;
  const other = mirrored ? wish.actId : wish.otherActId;
  const phrase = toRulePhrase({ kind, otherActName: nameOf(other), actKind: wish.actKind });

  return wish.strength === 'prefer' ? `möglichst ${phrase}` : phrase;
};

export const toEveningWishLabel = (actKind: ActKind | null, strength: Strength): string => {
  const kinds = actKind === null ? 'Auftritte' : toActKindPlural(actKind);

  return strength === 'must'
    ? `Nie zwei ${kinds} hintereinander`
    : `Möglichst keine zwei ${kinds} hintereinander`;
};

export const NAMED_RAIL_KINDS: readonly FindingKind[] = [
  'noChangeover',
  'tightChangeover',
  'absences',
];

const RAIL_NAME_LIST = new Intl.ListFormat('de-DE', { style: 'long', type: 'conjunction' });

export interface NamePart {
  personIndex: number | null;
  text: string;
}

export const toNameParts = (names: readonly string[]): NamePart[] => {
  let next = 0;

  return RAIL_NAME_LIST.formatToParts(names).map((part) => {
    if (part.type !== 'element') {
      return { personIndex: null, text: part.value };
    }

    next += 1;

    return { personIndex: next - 1, text: part.value };
  });
};

export const toRailTail = (kind: FindingKind, count: number): string => {
  switch (kind) {
    case 'noChangeover':
      return `${FACT_SEPARATOR}Keine Umziehzeit`;
    case 'tightChangeover':
      return `${FACT_SEPARATOR}nur ein Auftritt zum Umziehen`;
    case 'absences':
      return count === 1 ? ' hat abgesagt' : ' haben abgesagt';
    default:
      return '';
  }
};

export const PERSON_OPEN_LABEL = 'Auftritte zeigen';
export const STOP_OPEN_LABEL = 'Zum Auftritt';
export const PERSON_WAITING_TITLE = 'Noch nicht eingeplant';
export const PERSON_ABSENT_NOTE = 'Hat abgesagt – zählt in keinem Auftritt.';
export const PERSON_NOT_PLACED = 'In keinem eingeplanten Auftritt.';

export const toPersonOpenLabel = (name: string): string => `${name}: ${PERSON_OPEN_LABEL}`;

export const toPersonTimelineLabel = (name: string): string => `Auftritte von ${name}`;

export const toGapText = (gap: PersonGap): string => {
  switch (gap.state) {
    case 'conflict':
      return 'Keine Umziehzeit';
    case 'hint':
      return `${gap.between} dazwischen${FACT_SEPARATOR}knapp`;
    case 'fine':
      return `${gap.between} dazwischen`;
  }
};

export const toPersonFact = (timeline: PersonTimeline): string => {
  const appearances = toActsLabel(timeline.stops.length + timeline.waiting.length);

  if (timeline.absent) {
    return `${appearances}${FACT_SEPARATOR}abgesagt`;
  }

  const { conflicts, hints } = timeline.tally;
  const verdict =
    conflicts === 0 && hints === 0
      ? ['genug Umziehzeit']
      : [
          ...(conflicts === 0 ? [] : [count(conflicts, 'Konflikt', 'Konflikte')]),
          ...(hints === 0 ? [] : [count(hints, 'Hinweis', 'Hinweise')]),
        ];

  return [appearances, ...(timeline.stops.length > 1 ? verdict : [])].join(FACT_SEPARATOR);
};

export const toRailText = (
  finding: ReviewFinding,
  personNames: readonly string[],
  ruleLabel: string | null,
): string => {
  switch (finding.kind) {
    case 'noChangeover':
      return `${toNameList(personNames)}${FACT_SEPARATOR}Keine Umziehzeit`;
    case 'tightChangeover':
      return `${toNameList(personNames)}${FACT_SEPARATOR}nur ein Auftritt zum Umziehen`;
    case 'sameKindAdjacent':
      return 'Zwei Reden direkt hintereinander';
    case 'absences':
      return `${toNameList(personNames)} ${personNames.length === 1 ? 'hat' : 'haben'} abgesagt`;
    case 'nobodyThere':
      return 'Alle haben abgesagt';
    case 'mustRuleBroken':
    case 'preferRuleMissed':
      return ruleLabel ?? toFindingTitle(finding.kind);
    default:
      return toFindingTitle(finding.kind);
  }
};

const REASON_LABELS: Partial<Record<FindingKind, string>> = {
  noChangeover: 'jetzt mit Umziehzeit',
  tightChangeover: 'mehr Luft',
  mustRuleBroken: 'fester Wunsch erfüllt',
  preferRuleMissed: 'Wunsch erfüllt',
  sameKindAdjacent: 'Reden getrennt',
};

export const toReasonLabel = (kind: FindingKind): string =>
  REASON_LABELS[kind] ?? toFindingTitle(kind);

export const MORE_ROOM = 'mehr Umziehzeit';

export const toProposalReasons = (
  fromTray: boolean,
  reasons: readonly FindingKind[],
  moreRoom: boolean,
): string =>
  [
    ...(fromTray ? [NEWLY_PLACED] : []),
    ...reasons.filter((reason) => reason !== 'unplaced').map(toReasonLabel),
    ...(moreRoom ? [MORE_ROOM] : []),
  ].join(FACT_SEPARATOR);

export const HOLDS_TITLE = 'Warum Konflikte bleiben';
export const HOLDS_HIDE_LABEL = 'Ausblenden';
export const HOLDS_UNAVOIDABLE =
  'Ohne Konflikt geht es mit diesen Besetzungen nicht: dieselben Leute stehen in zu vielen Auftritten.';

export const toConflictCount = (amount: number): string => count(amount, 'Konflikt', 'Konflikte');

export const toHoldText = (held: number, without: number): string =>
  `hält ${toConflictCount(held)}${FACT_SEPARATOR}ohne: ${without}`;

export const toHoldTitle = (
  draft: RunningOrderDraft,
  hold: HoldRow,
  lineNameOf: (key: LineKey) => string,
  nameOf: (actId: number | null) => string | null,
): string => {
  switch (hold.kind) {
    case 'pin':
      return `Fester Platz von ${hold.lineKey === null ? '' : lineNameOf(hold.lineKey)}`;
    case 'block':
      return `${toNameList(hold.blockKeys.map(lineNameOf))} bleiben zusammen`;
    case 'mustRule': {
      const rule = draft.rules.find((candidate) => candidate.ruleKey === hold.ruleKey);

      if (rule === undefined) {
        return toFindingTitle('mustRuleBroken');
      }
      if (rule.kind === 'kindSpread') {
        return toEveningWishLabel(rule.actKind, rule.strength);
      }

      return toRuleSentence({
        kind: rule.kind,
        strength: rule.strength,
        actName: nameOf(rule.actId),
        otherActName: nameOf(rule.otherActId),
        actKind: rule.actKind,
      });
    }
    case 'mustWish': {
      const wish = draft.actWishes.find((candidate) => candidate.actWishId === hold.actWishId);

      return wish === undefined
        ? toFindingTitle('mustRuleBroken')
        : toRuleSentence({
            kind: wish.kind,
            strength: wish.strength,
            actName: nameOf(wish.actId),
            otherActName: null,
            actKind: null,
          });
    }
  }
};

const HOLD_ACTIONS: Record<HoldKind, string> = {
  pin: 'Platz freigeben',
  block: 'Trennen',
  mustRule: 'Nur möglichst',
  mustWish: 'Heute aus',
};

export const toHoldActionLabel = (kind: HoldKind): string => HOLD_ACTIONS[kind];

const HOLD_RELAXED: Record<HoldKind, string> = {
  pin: 'Platz freigegeben – neuer Vorschlag kommt.',
  block: 'Getrennt – neuer Vorschlag kommt.',
  mustRule: 'Nur noch möglichst – neuer Vorschlag kommt.',
  mustWish: 'Heute aus – neuer Vorschlag kommt.',
};

export const toHoldRelaxedMessage = (kind: HoldKind): string => HOLD_RELAXED[kind];

export const STRENGTH_CHOICES: readonly { id: Strength; label: string }[] = [
  { id: 'must', label: 'Muss' },
  { id: 'prefer', label: 'Möglichst' },
];

const KIND_CHOICE_LABELS: Record<RuleKind, string> = {
  first: 'Ganz am Anfang',
  last: 'Ganz am Ende',
  early: 'Früh',
  late: 'Spät',
  firstHalf: 'Erste Hälfte',
  secondHalf: 'Zweite Hälfte',
  before: 'Vor …',
  after: 'Nach …',
  apart: 'Abstand zu …',
  kindSpread: 'Nicht hintereinander',
};

export const toKindChoiceLabel = (kind: RuleKind): string => KIND_CHOICE_LABELS[kind];

export const toWishSentence = (name: string, strength: Strength, phrase: string | null): string => {
  if (phrase === null) {
    return `${name} ${strength === 'must' ? 'muss' : 'möglichst'} …`;
  }

  return strength === 'must' ? `${name} muss ${phrase} kommen` : `${name} möglichst ${phrase}`;
};

export const toSaveText = (state: 'empty' | 'saved' | 'saving' | 'failed' | 'conflict'): string => {
  switch (state) {
    case 'empty':
      return 'Noch kein Ablauf';
    case 'saved':
      return 'Gespeichert';
    case 'saving':
      return 'Speichert …';
    case 'failed':
      return 'Nicht gespeichert';
    case 'conflict':
      return 'Veraltet – neu laden';
  }
};

export const CONFIRMED_TEXT = 'Ablauf steht';
export const CHANGED_TEXT = 'Seit „steht“ geändert';

export const toFindingRuleLabel = (
  draft: RunningOrderDraft,
  finding: ReviewFinding,
  nameOf: (actId: number | null) => string | null,
): string | null => {
  const rule = draft.rules.find((candidate) => candidate.ruleKey === finding.ruleKey);
  const wish = draft.actWishes.find((candidate) => candidate.actWishId === finding.actWishId);
  const source = rule ?? wish;

  if (source === undefined) {
    return null;
  }

  const otherActId = rule?.otherActId ?? null;
  const actKind = rule?.actKind ?? null;

  if (source.kind === 'kindSpread') {
    return toEveningWishLabel(actKind, source.strength);
  }

  return toRuleSentence({
    kind: source.kind,
    strength: source.strength,
    actName: nameOf(source.actId),
    otherActName: nameOf(otherActId),
    actKind,
  });
};

export const toLineName = (
  key: LineKey | null,
  lineNameOf: (key: LineKey) => string,
): string | null => (key === null ? null : lineNameOf(key));

export const toBuilderStateText = (
  duplicate: boolean,
  outcome: WishState | null,
  needsOther: boolean,
): string => {
  if (duplicate) {
    return DUPLICATE_WISH;
  }
  if (outcome !== null) {
    return toWishStateLabel(outcome);
  }

  return needsOther ? PICK_OTHER : PICK_A_WISH;
};

export const toStatusText = (
  confirmed: boolean,
  changedSinceConfirmed: boolean,
  saveState: 'empty' | 'saved' | 'saving' | 'failed' | 'conflict',
): string => {
  if (!confirmed) {
    return toSaveText(saveState);
  }

  return changedSinceConfirmed ? CHANGED_TEXT : CONFIRMED_TEXT;
};

export const toMoveTitle = (name: string, from: number | null, to: number): string =>
  from === null
    ? `${name} → ${toPlaceNumber(to)}`
    : `${name}: ${toPlaceNumber(from)} → ${toPlaceNumber(to)}`;
