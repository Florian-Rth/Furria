import { actLineKeyOf, reviewRunningOrder, ruleKeyOf, tallyOf } from './running-order-review';
import type {
  ActWish,
  ActWishKind,
  CatalogueAct,
  LineKey,
  RuleBody,
  RunningOrderBody,
  RunningOrderLine,
  RunningOrderResponse,
  Suggestion,
} from './schemas';
import type {
  DraftLine,
  DraftRule,
  FindingTally,
  OrderUnit,
  ReviewFinding,
  RuleKey,
  RunningOrderDraft,
} from './types';

interface LineUnit {
  lines: DraftLine[];
  start: number;
  pinned: boolean;
}

export interface MovePreview {
  draft: RunningOrderDraft;
  order: LineKey[];
  findings: ReviewFinding[];
  tally: FindingTally;
}

const FIRST_BLOCK_KEY = 1;
const FIRST_DRAFT_RULE = 1;

export const EMPTY_DRAFT: RunningOrderDraft = {
  version: null,
  lines: [],
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
};

export const placedLinesOf = (draft: RunningOrderDraft): DraftLine[] =>
  draft.lines.filter((line) => line.placed);

export const unplacedLinesOf = (draft: RunningOrderDraft): DraftLine[] =>
  draft.lines.filter((line) => !line.placed);

export const orderOf = (draft: RunningOrderDraft): LineKey[] =>
  placedLinesOf(draft).map((line) => line.key);

const asUnplaced = (line: DraftLine): DraftLine => ({
  ...line,
  placed: false,
  pinned: false,
  blockKey: null,
});

const withLines = (
  draft: RunningOrderDraft,
  placed: readonly DraftLine[],
  unplaced: readonly DraftLine[],
): RunningOrderDraft => ({
  ...draft,
  lines: [...placed.map((line) => ({ ...line, placed: true })), ...unplaced.map(asUnplaced)],
});

const lineUnitsOf = (placed: readonly DraftLine[]): LineUnit[] =>
  placed.reduce<LineUnit[]>((units, line, index) => {
    const previous = units.at(-1);
    const joins =
      previous !== undefined &&
      line.blockKey !== null &&
      previous.lines.at(-1)?.blockKey === line.blockKey;

    if (joins) {
      previous.lines.push(line);
      previous.pinned = previous.pinned || line.pinned;
      return units;
    }

    units.push({ lines: [line], start: index, pinned: line.pinned });
    return units;
  }, []);

export const unitsOf = (draft: RunningOrderDraft): OrderUnit[] =>
  lineUnitsOf(placedLinesOf(draft)).map((unit) => ({
    keys: unit.lines.map((line) => line.key),
    start: unit.start,
    pinned: unit.pinned,
    blockKey: unit.lines[0]?.blockKey ?? null,
  }));

const sizeOf = (units: readonly LineUnit[]): number =>
  units.reduce((total, unit) => total + unit.lines.length, 0);

const anchorsOf = (pinned: readonly LineUnit[], length: number): LineUnit[] | null => {
  const sorted = [...pinned].sort((left, right) => left.start - right.start);
  const anchored: LineUnit[] = [];
  let limit = length;

  for (const unit of sorted.reverse()) {
    const start = Math.min(unit.start, limit - unit.lines.length);

    if (start < 0) {
      return null;
    }
    anchored.unshift({ ...unit, start });
    limit = start;
  }

  return anchored;
};

const layout = (
  pinned: readonly LineUnit[],
  movable: readonly LineUnit[],
  length: number,
): DraftLine[] | null => {
  const anchors = anchorsOf(pinned, length);

  if (anchors === null) {
    return null;
  }

  const queue = [...movable];
  const placed: DraftLine[] = [];
  let anchorIndex = 0;

  while (placed.length < length) {
    const anchor = anchors[anchorIndex];

    if (anchor !== undefined && anchor.start === placed.length) {
      placed.push(...anchor.lines);
      anchorIndex += 1;
      continue;
    }

    const gap = (anchor?.start ?? length) - placed.length;
    const fitting = queue.findIndex((unit) => unit.lines.length <= gap);
    const next = queue[fitting];

    if (next === undefined) {
      return null;
    }
    queue.splice(fitting, 1);
    placed.push(...next.lines);
  }

  return queue.length === 0 ? placed : null;
};

const settle = (
  draft: RunningOrderDraft,
  placed: readonly DraftLine[],
  unplaced: readonly DraftLine[],
): RunningOrderDraft => {
  const before = orderOf(draft);
  const units = lineUnitsOf(placed).map((unit) => {
    const first = unit.lines[0];
    const anchoredAt = first === undefined ? -1 : before.indexOf(first.key);

    return anchoredAt < 0 ? unit : { ...unit, start: anchoredAt };
  });
  const settled = layout(
    units.filter((unit) => unit.pinned),
    units.filter((unit) => !unit.pinned),
    placed.length,
  );

  return withLines(draft, settled ?? placed, unplaced);
};

const lineOf = (draft: RunningOrderDraft, key: LineKey): DraftLine | undefined =>
  draft.lines.find((line) => line.key === key);

export const moveUnit = (
  draft: RunningOrderDraft,
  key: LineKey,
  targetIndex: number,
): RunningOrderDraft => {
  const line = lineOf(draft, key);

  if (line === undefined) {
    return draft;
  }

  const units = lineUnitsOf(placedLinesOf(draft));
  const own = units.find((unit) => unit.lines.some((member) => member.key === key));

  if (own?.pinned === true) {
    return draft;
  }

  const moving: LineUnit = own ?? {
    lines: [{ ...line, placed: true, pinned: false, blockKey: null }],
    start: 0,
    pinned: false,
  };
  const rest = units.filter((unit) => unit !== own);
  const unplaced = unplacedLinesOf(draft).filter((member) => member.key !== key);
  const length = sizeOf(rest) + moving.lines.length;
  const target = Math.max(0, Math.min(targetIndex, length - moving.lines.length));
  const pinned = rest.filter((unit) => unit.pinned);
  const movable = rest.filter((unit) => !unit.pinned);
  let best: DraftLine[] | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let slot = 0; slot <= movable.length; slot += 1) {
    const candidate = layout(
      pinned,
      [...movable.slice(0, slot), moving, ...movable.slice(slot)],
      length,
    );
    const start = candidate?.findIndex((member) => member.key === moving.lines[0]?.key) ?? -1;
    const distance = Math.abs(start - target);

    if (candidate !== null && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best === null ? draft : withLines(draft, best, unplaced);
};

export const previewMove = (
  draft: RunningOrderDraft,
  key: LineKey,
  targetIndex: number,
): MovePreview => {
  const moved = moveUnit(draft, key, targetIndex);
  const findings = reviewRunningOrder(moved);

  return { draft: moved, order: orderOf(moved), findings, tally: tallyOf(findings) };
};

export const togglePin = (draft: RunningOrderDraft, key: LineKey): RunningOrderDraft => {
  const unit = unitsOf(draft).find((candidate) => candidate.keys.includes(key));

  if (unit === undefined) {
    return draft;
  }

  return {
    ...draft,
    lines: draft.lines.map((line) =>
      unit.keys.includes(line.key) ? { ...line, pinned: !unit.pinned } : line,
    ),
  };
};

const nextBlockKeyOf = (draft: RunningOrderDraft): number =>
  Math.max(FIRST_BLOCK_KEY - 1, ...draft.lines.map((line) => line.blockKey ?? 0)) + 1;

const blockRangeOf = (
  placed: readonly DraftLine[],
  from: number,
  to: number,
): { low: number; high: number } => {
  let low = Math.min(from, to);
  let high = Math.max(from, to);
  let grown = true;

  while (grown) {
    const keys = placed
      .slice(low, high + 1)
      .flatMap((line) => (line.blockKey === null ? [] : [line.blockKey]));
    const members = placed.flatMap((line, index) =>
      line.blockKey !== null && keys.includes(line.blockKey) ? [index] : [],
    );
    const nextLow = Math.min(low, ...members);
    const nextHigh = Math.max(high, ...members);

    grown = nextLow !== low || nextHigh !== high;
    low = nextLow;
    high = nextHigh;
  }

  return { low, high };
};

export const formBlock = (
  draft: RunningOrderDraft,
  fromKey: LineKey,
  toKey: LineKey,
): RunningOrderDraft => {
  const placed = placedLinesOf(draft);
  const from = placed.findIndex((line) => line.key === fromKey);
  const to = placed.findIndex((line) => line.key === toKey);

  if (from < 0 || to < 0) {
    return draft;
  }

  const { low, high } = blockRangeOf(placed, from, to);
  const members = placed.slice(low, high + 1);

  if (members.length < 2) {
    return draft;
  }

  const existingKeys = members.flatMap((line) => (line.blockKey === null ? [] : [line.blockKey]));
  const blockKey = existingKeys.length === 0 ? nextBlockKeyOf(draft) : Math.min(...existingKeys);
  const pinned = members.some((line) => line.pinned);
  const memberKeys = members.map((line) => line.key);

  return {
    ...draft,
    lines: draft.lines.map((line) =>
      memberKeys.includes(line.key) ? { ...line, blockKey, pinned } : line,
    ),
  };
};

export const dissolveBlock = (draft: RunningOrderDraft, key: LineKey): RunningOrderDraft => {
  const blockKey = lineOf(draft, key)?.blockKey ?? null;

  if (blockKey === null) {
    return draft;
  }

  return {
    ...draft,
    lines: draft.lines.map((line) =>
      line.blockKey === blockKey ? { ...line, blockKey: null } : line,
    ),
  };
};

const withoutLonelyBlocks = (placed: readonly DraftLine[]): DraftLine[] =>
  placed.map((line) =>
    line.blockKey !== null &&
    placed.filter((member) => member.blockKey === line.blockKey).length < 2
      ? { ...line, blockKey: null }
      : line,
  );

export const place = (
  draft: RunningOrderDraft,
  key: LineKey,
  index: number = placedLinesOf(draft).length,
): RunningOrderDraft =>
  lineOf(draft, key)?.placed === false ? moveUnit(draft, key, index) : draft;

export const unplace = (draft: RunningOrderDraft, key: LineKey): RunningOrderDraft => {
  const line = lineOf(draft, key);

  if (line === undefined || !line.placed) {
    return draft;
  }

  const placed = withoutLonelyBlocks(placedLinesOf(draft).filter((member) => member.key !== key));

  return settle(draft, placed, [...unplacedLinesOf(draft), line]);
};

const effectiveWishKindsOf = (draft: RunningOrderDraft, actId: number): ActWishKind[] =>
  draft.actWishes
    .filter((wish) => wish.actId === actId && !draft.suspendedActWishIds.includes(wish.actWishId))
    .map((wish) => wish.kind);

const lineOfAct = (act: CatalogueAct): DraftLine => ({
  key: actLineKeyOf(act.actId),
  lineId: null,
  act: { actId: act.actId, name: act.name, kind: act.kind, group: act.group, cast: act.cast },
  placed: true,
  pinned: false,
  blockKey: null,
  eveningChanges: [],
});

const lastIndexOf = (draft: RunningOrderDraft): number => placedLinesOf(draft).length - 1;

const placeByWish = (draft: RunningOrderDraft, actId: number): RunningOrderDraft => {
  const key = actLineKeyOf(actId);
  const kinds = effectiveWishKindsOf(draft, actId);

  if (kinds.includes('first')) {
    return moveUnit(draft, key, 0);
  }
  if (kinds.includes('last')) {
    return moveUnit(draft, key, lastIndexOf(draft));
  }

  return draft;
};

const trailingLastKeyOf = (draft: RunningOrderDraft): LineKey | null => {
  const last = placedLinesOf(draft).at(-1);

  return last !== undefined && effectiveWishKindsOf(draft, last.act.actId).includes('last')
    ? last.key
    : null;
};

export const pickActs = (
  draft: RunningOrderDraft,
  catalogue: readonly CatalogueAct[],
  actIds: readonly number[],
): RunningOrderDraft => {
  const present = draft.lines.map((line) => line.key);
  const picked = actIds.flatMap((actId) => {
    const act = catalogue.find((candidate) => candidate.actId === actId);

    return act === undefined || present.includes(actLineKeyOf(actId)) ? [] : [act];
  });

  if (picked.length === 0) {
    return draft;
  }

  const knownWishIds = draft.actWishes.map((wish) => wish.actWishId);
  const wishes: ActWish[] = picked
    .flatMap((act) => act.wishes)
    .filter((wish) => !knownWishIds.includes(wish.actWishId));
  const trailingLast = trailingLastKeyOf(draft);
  const appended = settle(
    { ...draft, actWishes: [...draft.actWishes, ...wishes] },
    [...placedLinesOf(draft), ...picked.map(lineOfAct)],
    unplacedLinesOf(draft),
  );
  const wished = picked.reduce((current, act) => placeByWish(current, act.actId), appended);
  const newLastWanted = picked.some((act) =>
    effectiveWishKindsOf(wished, act.actId).includes('last'),
  );

  return trailingLast === null || newLastWanted
    ? wished
    : moveUnit(wished, trailingLast, lastIndexOf(wished));
};

export const isDroppable = (line: DraftLine): boolean => line.eveningChanges.length === 0;

export const dropAct = (draft: RunningOrderDraft, actId: number): RunningOrderDraft => {
  const key = actLineKeyOf(actId);
  const line = lineOf(draft, key);

  if (line === undefined || !isDroppable(line)) {
    return draft;
  }

  const droppedWishIds = draft.actWishes
    .filter((wish) => wish.actId === actId)
    .map((wish) => wish.actWishId);
  const trimmed: RunningOrderDraft = {
    ...draft,
    rules: draft.rules.filter((rule) => rule.actId !== actId && rule.otherActId !== actId),
    actWishes: draft.actWishes.filter((wish) => wish.actId !== actId),
    suspendedActWishIds: draft.suspendedActWishIds.filter(
      (actWishId) => !droppedWishIds.includes(actWishId),
    ),
  };

  return settle(
    trimmed,
    withoutLonelyBlocks(placedLinesOf(draft).filter((candidate) => candidate.key !== key)),
    unplacedLinesOf(draft).filter((candidate) => candidate.key !== key),
  );
};

const nextDraftRuleOf = (rules: readonly DraftRule[]): number =>
  rules.reduce((highest, rule) => {
    const [scope, number] = rule.ruleKey.split(':');

    return scope === 'draft' ? Math.max(highest, Number(number) + 1) : highest;
  }, FIRST_DRAFT_RULE);

export const addRule = (draft: RunningOrderDraft, rule: RuleBody): RunningOrderDraft => ({
  ...draft,
  rules: [
    ...draft.rules,
    { ...rule, ruleId: null, ruleKey: `draft:${nextDraftRuleOf(draft.rules)}` },
  ],
});

export const removeRule = (draft: RunningOrderDraft, ruleKey: RuleKey): RunningOrderDraft => ({
  ...draft,
  rules: draft.rules.filter((rule) => rule.ruleKey !== ruleKey),
});

export const toggleActWish = (draft: RunningOrderDraft, actWishId: number): RunningOrderDraft => ({
  ...draft,
  suspendedActWishIds: draft.suspendedActWishIds.includes(actWishId)
    ? draft.suspendedActWishIds.filter((candidate) => candidate !== actWishId)
    : [...draft.suspendedActWishIds, actWishId],
});

const keepsPinsAndBlocks = (before: readonly DraftLine[], after: readonly DraftLine[]): boolean => {
  const pinsKept = before.every((line, index) => !line.pinned || after[index]?.key === line.key);
  const blocksContiguous = after.every((line, index) => {
    if (line.blockKey === null) {
      return true;
    }

    const first = after.findIndex((member) => member.blockKey === line.blockKey);

    return index === first || after[index - 1]?.blockKey === line.blockKey;
  });

  return pinsKept && blocksContiguous;
};

const fullOrderOf = (draft: RunningOrderDraft, suggestion: Suggestion): DraftLine[] | null => {
  const placed = placedLinesOf(draft);
  const ordered = suggestion.order.flatMap((key) => {
    const line = placed.find((candidate) => candidate.key === key);

    return line === undefined ? [] : [line];
  });

  return ordered.length === placed.length && keepsPinsAndBlocks(placed, ordered) ? ordered : null;
};

export const applySuggestion = (
  draft: RunningOrderDraft,
  suggestion: Suggestion,
  lineKeys?: readonly LineKey[],
): RunningOrderDraft => {
  const whole = lineKeys === undefined ? fullOrderOf(draft, suggestion) : null;

  if (whole !== null) {
    return withLines(draft, whole, unplacedLinesOf(draft));
  }

  return suggestion.moves
    .filter((move) => lineKeys === undefined || lineKeys.includes(move.lineKey))
    .reduce((current, move) => moveUnit(current, move.lineKey, move.to), draft);
};

const draftLineOf = (line: RunningOrderLine): DraftLine => ({
  key: actLineKeyOf(line.act.actId),
  lineId: line.lineId,
  act: line.act,
  placed: line.position !== null,
  pinned: line.position !== null && line.pinned,
  blockKey: line.position === null ? null : line.blockKey,
  eveningChanges: line.eveningChanges,
});

export const draftOf = (response: RunningOrderResponse): RunningOrderDraft => {
  const placed = response.lines
    .filter((line) => line.position !== null)
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
  const unplaced = response.lines.filter((line) => line.position === null);

  return {
    version: response.version,
    lines: [...placed, ...unplaced].map(draftLineOf),
    rules: response.rules.map((rule) => ({ ...rule, ruleKey: ruleKeyOf(rule.ruleId) })),
    actWishes: response.actWishes.map(({ actWishId, actId, kind, strength }) => ({
      actWishId,
      actId,
      kind,
      strength,
    })),
    suspendedActWishIds: response.actWishes
      .filter((wish) => wish.suspended)
      .map((wish) => wish.actWishId),
  };
};

export const bodyOf = (draft: RunningOrderDraft): RunningOrderBody => {
  const order = orderOf(draft);

  return {
    version: draft.version,
    lines: draft.lines.map((line) => ({
      actId: line.act.actId,
      position: line.placed ? order.indexOf(line.key) : null,
      pinned: line.placed && line.pinned,
      blockKey: line.placed ? line.blockKey : null,
    })),
    rules: draft.rules.map(({ kind, strength, actId, otherActId, actKind }) => ({
      kind,
      strength,
      actId,
      otherActId,
      actKind,
    })),
    suspendedActWishIds: draft.suspendedActWishIds,
  };
};
